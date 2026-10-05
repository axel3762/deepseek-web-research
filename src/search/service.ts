/** Multi-provider search service. */
import type { SearchOptions, SearchResponse, SearchResult, SearchProvider } from '../providers/types.js';
import { SearXNGProvider, DuckDuckGoProvider } from '../providers/index.js';
import { normalizeUrl } from '../utils/url.js';

export interface SearchServiceConfig { enableFallback?: boolean; maxResults?: number; timeoutMs?: number; cacheTTL?: number; }
interface CacheEntry { results: SearchResult[]; timestamp: number; source: string; }

export class SearchService {
  private providers: SearchProvider[];
  private config: Required<SearchServiceConfig>;
  private resultCache = new Map<string, CacheEntry>();
  constructor(config?: SearchServiceConfig) {
    this.config={enableFallback:true,maxResults:20,timeoutMs:10000,cacheTTL:60000,...config};
    this.providers=[new SearXNGProvider(),new DuckDuckGoProvider()].filter(p=>p.enabled);
  }
  async search(query:string, options:SearchOptions={}):Promise<SearchResponse>{
    const cacheKey=this.cacheKey(query,options); const cached=this.resultCache.get(cacheKey);
    if(cached && Date.now()-cached.timestamp<this.config.cacheTTL) return {results:cached.results,query,source:{name:cached.source},success:true};
    let lastError:unknown;
    const providers=options.provider && options.provider!=='auto' ? this.providers.filter(p=>p.name===options.provider) : this.providers;
    for(const provider of providers){
      try {
        const response=await provider.search(query,{...options,maxResults:options.maxResults??this.config.maxResults,timeoutMs:this.config.timeoutMs});
        if(response.success && response.results.length){
          const results=this.deduplicateAndRank(response.results,query).slice(0,options.maxResults??this.config.maxResults);
          this.resultCache.set(cacheKey,{results,timestamp:Date.now(),source:provider.name});
          return {...response,results,totalResults:response.totalResults??results.length,source:{name:provider.name},success:true};
        }
        lastError=new Error(`Provider ${provider.name} returned no results`);
      } catch(e){ lastError=e; if(!this.config.enableFallback) break; }
    }
    return {results:[],query,source:{name:'unknown'},success:false};
  }
  private deduplicateAndRank(results:SearchResult[],query:string):SearchResult[]{
    const byUrl=new Map<string,SearchResult>();
    for(const r of results){ const key=normalizeUrl(r.url); const prev=byUrl.get(key); if(!prev||r.rank<prev.rank) byUrl.set(key,{...r,url:key}); }
    return [...byUrl.values()].sort((a,b)=>{const rb=this.relevance(b,query),ra=this.relevance(a,query); return rb!==ra?rb-ra:a.rank-b.rank;});
  }
  private relevance(r:SearchResult,q:string):number{const text=`${r.title} ${r.snippet??''}`.toLowerCase(); return q.toLowerCase().split(/\s+/).filter(Boolean).reduce((n,w)=>n+(text.includes(w)?1:0),0);}
  private cacheKey(query:string,options:SearchOptions):string{return JSON.stringify([query,options.provider??'auto',options.maxResults??this.config.maxResults,options.recency??'any',options.domains??[],options.excludeDomains??[],options.language??'']);}
  setCacheTtl(ttl:number){this.config.cacheTTL=ttl;}
  getProviders(){return this.providers.map(p=>({name:p.name,enabled:p.enabled,description:p.description}));}
}
