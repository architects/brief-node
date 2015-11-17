let __cache = {}

export default class Resolver {
  /*
  * we should eliminate the caching here as it doesn't
  * make sense
  */
  static create(briefcase){
    let existing = __cache[briefcase.root]
    if(existing) { return existing }

    return __cache[briefcase.root] = new Resolver(briefcase)
  }

  constructor(briefcase){
    __cache[briefcase.root] = this
    this.briefcase = briefcase
  }
  
  forLinks(linkResolver){
    this.linkResolver = linkResolver
  }

  forAssets(assetPathResolver){
    this.assetPathResolver = assetPathResolver
  }

  resolveLink(pathAlias){
    if(!this.linkResolver){
      return pathAlias
    }

    return this.linkResolver(pathAlias)
  }

  resolveAssetPath(pathAlias){
    return this.assetPathResolver(pathAlias)
  }
}
