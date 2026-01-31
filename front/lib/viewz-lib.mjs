let lib = {};

window.VIEWZ_HTML_PROCESSORS = [];

export let viewzLib = lib;

import { ViewZ } from "https://cdn.jsdelivr.net/gh/Bakino/viewz@2f6b406a6e64fac23471d16d355bc64887cafd56/lib/viewz.mjs" ;
import { registerFormatter } from "https://cdn.jsdelivr.net/gh/Bakino/viewz@2f6b406a6e64fac23471d16d355bc64887cafd56/lib/bindz.mjs" ;
import { startViewZ } from "https://cdn.jsdelivr.net/gh/Bakino/viewz@2f6b406a6e64fac23471d16d355bc64887cafd56/lib/frameworkz.mjs" ;

export { startViewZ } ;

if(window.BAMZ_IN_PLUGIN){ 
    // inside a plugin screen, don't interfere with it
    
} else {
    window.bamzWaitLoaded().then(async ()=>{
        const formatters = (await import(`/open-bamz-viewz/bindz-formatters`)).default ;
        //ensure all plugin are loaded before add extensions
        for(let formatter of formatters){
            registerFormatter(formatter) ;
        }
    
        const extensions = (await import(`/open-bamz-viewz/viewz-extensions`)).default ;
        //ensure all plugin are loaded before add extensions
        for(let ext of extensions){
            ViewZ.loadExtension(ext) ;
        }
        if(!window.BAMZ_NO_ROUTERZ){
            startViewZ() ;
        }
    })
}

