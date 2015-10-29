let __cache = {}

export default class Resolver {
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
      throw('Must supply a link resolver function. briefcase.resolver.forLinks(myFunction)')
    }

    return this.linkResolver(pathAlias)
  }

  resolveAssetPath(pathAlias){
    return this.assetPathResolver(pathAlias)
  }
}
