let lib = {};

window.VIEWZ_HTML_PROCESSORS = [];

export let viewzLib = lib;

import { ViewZ } from "https://cdn.jsdelivr.net/gh/Bakino/viewz@a10871da450f23bc429b924559b467219c0e63a4/lib/viewz.mjs" ;
import { registerFormatter } from "https://cdn.jsdelivr.net/gh/Bakino/viewz@a10871da450f23bc429b924559b467219c0e63a4/lib/bindz.mjs" ;
import { startViewZ } from "https://cdn.jsdelivr.net/gh/Bakino/viewz@a10871da450f23bc429b924559b467219c0e63a4/lib/frameworkz.mjs" ;

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

