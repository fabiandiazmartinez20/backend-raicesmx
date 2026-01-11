'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">raicesmx-backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' : 'data-bs-target="#xs-controllers-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' :
                                            'id="xs-controllers-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' : 'data-bs-target="#xs-injectables-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' :
                                        'id="xs-injectables-links-module-AppModule-296803f8049800821323ecb5fd35c728df131823a2d54e652af4bea8fb0a406d2d6aa1e4b7ed8a96bfb926e1f6002d69f3d733ccadba05c56e03a60812e0b057"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' :
                                            'id="xs-controllers-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' :
                                        'id="xs-injectables-links-module-AuthModule-af3edb41f159c0da22d5beee607af16ff33e5156ea95484e4f18487d4d3731d80ad30ed7102637f53f9b0f77fee531911ddad82bcc7c685e18a5be616436d896"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' :
                                            'id="xs-controllers-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' :
                                        'id="xs-injectables-links-module-UsersModule-3de4f187e626e34576555e374d98ff91b2cbe465a21ba6323342d042046857da4af106314a24ead32bbdfb55ea70ffa02c220157c9c41f6d280d6b1a8ebe2b89"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/User.html" data-type="entity-link" >User</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginDto.html" data-type="entity-link" >LoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterDto.html" data-type="entity-link" >RegisterDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/SellerGuard.html" data-type="entity-link" >SellerGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});