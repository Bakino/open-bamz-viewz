import path from "path";
import express from "express";
import { generateSsrContent } from "viewz/server/viewzSsr.mjs";
import {ensureDir, pathExists} from 'fs-extra'
import { readFile, writeFile, stat } from "fs/promises";

/**
 * Called on each application startup (or when the plugin is enabled)
 * 
 * Use it to prepare the database and files needed by the plugin
 */
export const prepareDatabase = async ({options, filesDirectory}) => {
    let publicDir = path.join(filesDirectory, "public") ;
    await ensureDir(publicDir) ;

    //create default route file if not exist
    let routeFile = path.join(publicDir, "routes.json") ;
    if(!await pathExists(routeFile)){
        await writeFile(routeFile, `{
    "options": { "mode": "BROWSER" },
    "routes": [
        { "route": "/", "path": "views/root" }
    ]
}`, {encoding: "utf8"}) ;
    } 
    
    //create default root view if not exist
    let viewRootDir = path.join(publicDir, "views", "root") ;
    await ensureDir(viewRootDir) ;


    let rootHtmlFile = path.join(viewRootDir, "root.html") ;
    let rootCssFile = path.join(viewRootDir, "root.css") ;
    let rootJsFile = path.join(viewRootDir, "root.js") ;
    if(!await pathExists(rootHtmlFile)){
        await writeFile(rootHtmlFile, `<h1>Welcome to your application</h1>`, {encoding: "utf8"}) ;
    } 
    if(!await pathExists(rootCssFile)){
        await writeFile(rootCssFile, `/*Put your CSS rule here*/`, {encoding: "utf8"}) ;
    }
    if(!await pathExists(rootJsFile)){
        await writeFile(rootJsFile, `//Script goes here`, {encoding: "utf8"}) ;
    }

    //add base tag to index.html if not present
    let indexHtmlFile = path.join(publicDir, "index.html") ;

    let indexHtml = await readFile(indexHtmlFile, {encoding: "utf8"}) ;
    if(!indexHtml.includes("<base")){
        let baseCode = `<base href="/app/${options.database}/">`
        let indexEndHead  = indexHtml.toLowerCase().indexOf("</head") ;
        let indexInsertBase = indexEndHead ; 
        if(indexEndHead === -1){
            let indexBody = indexHtml.toLowerCase().indexOf("<body") ;
            baseCode = `<head>${baseCode}</head>` ;
            indexInsertBase = indexBody ;
            if(indexBody === -1){
                let indexTagHtml = indexHtml.toLowerCase().indexOf("<html") ;
                if(indexTagHtml !== -1){
                    indexInsertBase = indexHtml.indexOf(">", indexTagHtml)+1 ;
                }else{
                    indexInsertBase = 0;
                }
            }
        }
        indexHtml = indexHtml.substring(0, indexInsertBase)+baseCode+indexHtml.substring(indexInsertBase) ;
        await writeFile(indexHtmlFile, indexHtml, {encoding: "utf8"}) ;
    }

}

/**
 * Called when the plugin is disabled
 * 
 * Use it to eventually clean the database and files created by the plugin
 */
export const cleanDatabase = async () => {
}

/**
 * Init plugin when Open BamZ platform start
 */
export const initPlugin = async ({app, runQuery, logger, loadPluginData, contextOfApp, hasCurrentPlugin, injectBamz}) => {
    const router = express.Router();

    const handlersByAppName = {}

    //must recompute SSR handler when these file changed
    const filesContainer = ["index.html", "routes.json"] ;
    
    async function getHandlers (appName){
        if(!handlersByAppName[appName]){
            await prepareHandlers (appName) ;
        }
        let handler = handlersByAppName[appName];

        const sourcePath = path.join(process.env.DATA_DIR, "apps" ,appName, "public");
        for(let f of filesContainer){
            let s = await stat(path.join(sourcePath, f)) ;
            if(handler.fileStats[f].mtime < s.mtime){
                // file have changed, reprepare the handler
                await prepareHandlers (appName) ;
                break;
            }
        }

        return  handlersByAppName[appName];
    }

    async function prepareHandlers (appName){
        const sourcePath = path.join(process.env.DATA_DIR, "apps" ,appName, "public");

        let contextApp = await contextOfApp(appName) ;
        let requestHandler = await generateSsrContent({ sourcePath, htmlProcessors: contextApp.pluginsData.viewz.pluginSlots.htmlProcessors });
        let fileStats = {} ;
        for(let f of filesContainer){
            fileStats[f] = await stat(path.join(sourcePath, f)) ;
        }
        handlersByAppName[appName] = { requestHandler,  fileStats} ;
    }

    

    app.use("/app/:appName", (req, res, next)=>{
        (async ()=>{
            try{
                let appName = req.params.appName;

                let hasPlugin = (await runQuery({database: appName}, "SELECT plugin_id FROM openbamz.plugins WHERE plugin_id='viewz'")).rows.length>0;
                if(hasPlugin){
                    let handler = await getHandlers(appName) ;
                    let html = await handler.requestHandler(req) ;
                    if(!html){ return next() ; }
                    //inject openbamz admin banner
                    html = injectBamz(html, appName) ;
                    //html = html.replace('<body>', `<body style="opacity:0"><script>window.BAMZ_APP = '${appName}' ;</script><script type="module" src="/_openbamz_admin.js?appName=${appName}"></script>`);
                    res.end(html) ;
                }else{
                    next();
                }
            }catch(err){
                logger.error("Error while handling app SSR request %o", err);
                res.status(err.statusCode??500).json(err);
            }
        })();
    });

    router.get('/viewz-extensions/:appName', (req, res, next) => {
        (async ()=>{

            let appName = req.params.appName ;
            if(await hasCurrentPlugin(appName)){
            
                let appContext = await contextOfApp(appName) ;
                let allowedExtensions = appContext.pluginsData["viewz"]?.pluginSlots?.viewzExtensions??[] ;
                let js = `let extensions = [];`;
                for(let i=0; i<allowedExtensions.length; i++){
                    let ext = allowedExtensions[i];
                    js += `
                    import ext${i} from "${ext.extensionPath.replace(":appName", appName)}" ;
                    extensions.push({ plugin: "${ext.plugin}", ...ext${i}}) ;
                    `
                }
                js += `export default extensions`;
                res.setHeader("Content-Type", "application/javascript");
                res.end(js);
            }else{
                next() ;
            }
        })();
    });

    router.get("/definitions/:appName/ext-lib.d.ts", async (req, res)=>{
        let appName = req.params.appName ;
        
        let appContext = await contextOfApp(appName) ;
        let allowedExtensions = appContext.pluginsData["viewz"]?.pluginSlots?.viewzExtensions??[] ;
        for(let ext of allowedExtensions){
            if(ext["d.ts"]){
                res.write(ext["d.ts"]) ;
            }
        }
        res.end();
    });

    router.get('/bindz-formatters/:appName', (req, res, next) => {
        (async ()=>{

            let appName = req.params.appName ;
            if(await hasCurrentPlugin(appName)){
            
                let appContext = await contextOfApp(appName) ;
                let allowedFormatters = appContext.pluginsData["viewz"]?.pluginSlots?.bindzFormatters??[] ;
                let js = `let formatters = [];`;
                for(let i=0; i<allowedFormatters.length; i++){
                    let ext = allowedFormatters[i];
                    js += `
                    import ext${i} from "${ext.formatterPath.replace(":appName", appName)}" ;
                    formatters.push({ plugin: "${ext.plugin}", ...ext${i}}) ;
                    `
                }
                js += `export default formatters`;
                res.setHeader("Content-Type", "application/javascript");
                res.end(js);
            }else{
                next() ;
            }
        })();
    });
    

    loadPluginData(async ({pluginsData})=>{
        if(pluginsData?.["grapesjs-editor"]?.pluginSlots?.grapesJsEditor){
            pluginsData?.["grapesjs-editor"]?.pluginSlots?.grapesJsEditor.push( {
                plugin: "viewz",
                extensionPath: "/plugin/:appName/viewz/editor/grapesjs-viewz-extension.mjs"
            })
        }

        if(pluginsData?.["code-editor"]?.pluginSlots?.javascriptApiDef){
            pluginsData?.["code-editor"]?.pluginSlots?.javascriptApiDef.push( {
                plugin: "viewz",
                url: "/plugin/:appName/viewz/lib/viewz.d.ts"
            })
            pluginsData?.["code-editor"]?.pluginSlots?.javascriptApiDef.push( {
                plugin: "viewz",
                url: "/viewz/definitions/:appName/ext-lib.d.ts"
            })           
        }
        if(pluginsData?.["code-editor"]?.pluginSlots?.codeEditors){
            pluginsData?.["code-editor"]?.pluginSlots?.codeEditors.push( {
                plugin: "viewz",
                extensionPath: "/plugin/:appName/viewz/editor/route-editor-extension.mjs"
            })
        }
        if(pluginsData?.["ag-grid"]?.pluginSlots?.agGridExtensions){
            pluginsData?.["ag-grid"]?.pluginSlots?.agGridExtensions.push( {
                plugin: "dbadmin",
                extensionPath: "/plugin/:appName/viewz/lib/ag-grid-viewz.mjs"
            })
        }

        //register bamz client lib
        if(pluginsData?.["code-editor"]?.pluginSlots?.javascriptApiDef){
            pluginsData?.["code-editor"]?.pluginSlots?.javascriptApiDef.push( {
                plugin: "viewz",
                url: "/bamz-lib/bamz-client.d.ts"
            })
        }


        if(pluginsData?.["viewz"]?.pluginSlots?.viewzExtensions){
            pluginsData?.["viewz"]?.pluginSlots?.viewzExtensions.push( {
                plugin: "viewz",
                extensionPath: "/plugin/:appName/viewz/lib/viewz-bamz.mjs",
                "d.ts": `
                declare const bamz: BamzClient;
                `
            })
        }
    })
    

    return {
        // path in which the plugin provide its front end files
        frontEndPath: "front",
        frontEndLib: "lib/viewz-lib.mjs",
        router: router,
        //menu entries
        menu: [
            {
                name: "admin", entries: [
                    { name: "View Z", link: "/plugin/:appName/viewz/" }
                ]
            }
        ],
        pluginSlots: {
            htmlProcessors: [],
            viewzExtensions: [],
            bindzFormatters: []
        }
    }
}