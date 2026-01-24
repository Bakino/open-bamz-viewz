import { bind } from "https://cdn.jsdelivr.net/gh/Bakino/viewz@f029633dae5d68ef8f227b1afe3636e5c9cfba5b/lib/bindz.mjs" ;


function renderCell(elCell, {html, data, eGridCell}){
    elCell.innerHTML = html;
    
    //remove the flag indicating that the HTML was already prepared
    elCell.removeAttribute("zz-bind-prepared") ;
    delete elCell.__zzBindPrepared ;


    let parentViewContainer = eGridCell.closest("[zz-bind-root]") ;
    if(parentViewContainer && parentViewContainer.contextz && parentViewContainer.contextz.view){
        elCell.contextz = {view: parentViewContainer.contextz.view} ;
    }
    bind(elCell, data, elCell.contextz);//, null, null, true);
    if(elCell.contextz && elCell.contextz.view){
        elCell.contextz.view.dispatchEvent("viewz-cell-rendered", { element: elCell, data: data }) ;
    }
}


export class CellViewZRenderer {
    constructor() { }
    init(params) {
        if(!this.elCell){
            this.elCell = document.createElement('div');
            this.elCell.style.display = "flex";
            this.elCell.style.height = "100%";
            this.elCell.style.alignItems = "center";
        }

        if(!params.data && params.node?.data){
            params.data = params.node.data
        }
        
        setTimeout(()=>{
            renderCell(this.elCell, params) ;
        }, 1);
    }
    getGui() {
        return this.elCell;
    }
    refresh(params) {
        if(!params.data && params.node?.data){
            params.data = params.node.data
        }
        renderCell(this.elCell, params) ;

        return true;
    }
    destroy() {
    }
}

//https://www.ag-grid.com/javascript-data-grid/cell-editors/
export class CellViewZEditor {
    init(params) {
        if(!this.elCell){
            this.elCell = document.createElement('div');
        }

        if(!params.data && params.node?.data){
            params.data = params.node.data
        }
        this.data = params.data;
        this.params = params;
        
        //setTimeout(()=>{
            renderCell(this.elCell, {
                html: params.html,
                eGridCell: params.eGridCell,
                data: this.data,
            }) ;
        //}, 1);
    }
    afterGuiAttached(){
        let input = this.elCell.querySelector("input") ;
        if(!input){
            input = this.elCell.querySelector("select") ;
        }
        if(input){
            input.focus() ;
        }
    }
    getGui() {
        return this.elCell;
    }
    getValue(){
        return this.data[this.params.colDef.field] ;
    }
    destroy() {
    }
}

export default {
    /**
     * This function receive a column options (https://www.ag-grid.com/javascript-data-grid/column-definitions/)
     * and add a cell renderer that handle viewz rendering
     */
    columnOptionsTransformer: async function({ options, html }){
        if(html && !options.cellRenderer){
            options.cellRenderer = CellViewZRenderer ;
            options.cellRendererParams = {
                html: html,
            } ;
            const divFormatter = document.createElement("div") ;
            divFormatter.innerHTML = html ;
            options.valueFormatter = (params)=>{
                renderCell(divFormatter, {
                    html: html,
                    eGridCell: divFormatter,
                    data: params.data,
                }) ;
                return divFormatter.innerText ;
            }

            return options ;
        }
    },
    components: {
        CellViewZRenderer,
        CellViewZEditor
    },
    extends: (AgGridElement)=>{

        /**********  override rowData to listen to modification and autorefresh  ***********/
        const descriptor = Object.getOwnPropertyDescriptor(AgGridElement.prototype, 'rowData');

        const originalSetter = descriptor.set;
        descriptor.set = function(rowData) {
            if(typeof(rowData) === "string" && rowData.trim()[0]=== "$"){
                //ignore this value, it is a not yet bound pattern (ex "${myArray}")
                return;
            }

            //add a listener to auto update the table if the data are changed somewhere
            if(rowData && rowData.addListener){
                this.getGrid().then(()=>{
                    rowData.addListener("*.*", (ev)=>{
                        if(this.grid){
                            this.grid.applyTransaction({ update: [ev.target] });
                        }
                    })
                });
            }
            return originalSetter.call(this, rowData);
        };

        Object.defineProperty(AgGridElement.prototype, 'rowData', descriptor);


        /**********  override addEventListener to give context  ***********/
        const originalAddEventListener = AgGridElement.prototype.addEventListener ;
        AgGridElement.prototype.addEventListener = function(name, callback, options){
            originalAddEventListener.bind(this)(name, (event)=>{
                // give itemData to context
                let itemData = event.data ;
                if(event.type === "rowSelected"){
                    if(!event.node.isSelected()){
                        //current node is not selected, its means that it is a unselect event, don't pass the item
                        itemData = null;
                    }
                }
                callback(event, { itemData }) ;
            }, options)
        }


    }
}