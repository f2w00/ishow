(function(){"use strict";var e={53148:function(e,t,n){var r=n(49242),o=n(37335),i=(n(54415),n(73396));const a={id:"app"};function u(e,t){const n=(0,i.up)("router-view");return(0,i.wg)(),(0,i.iD)("div",a,[(0,i.Wm)(n)])}var l=n(40089);const c={},f=(0,l.Z)(c,[["render",u]]);var s=f,d=n(22483);const p=[{path:"/",name:"home",component:()=>n.e(788).then(n.bind(n,91788)),children:[{path:"luckysheet",name:"luckysheet",component:()=>n.e(67).then(n.bind(n,74067))}]}],h=(0,d.p7)({history:(0,d.r5)(""),routes:p});var m=h,g=n(24239);(0,r.ri)(s).use(g.Z).use(m).use(o.Z).mount("#app")},24239:function(e,t,n){var r=n(20065);t.Z=(0,r.MT)({state:{tableHead:{title:null},spliter:null,filter:null,grouper:null,formatter:null,replace:null,append:null,split:!1,sort:null,printer:"",luckyRange:null,luckyOptions:{container:"luckysheet",title:"万能报表",lang:"zh",plugins:["chart"],data:[],column:26,row:60,showtoolbar:!1,showtoolbarConfig:{undoRedo:!0,paintFormat:!0,currencyFormat:!0,percentageFormat:!0,numberDecrease:!0,numberIncrease:!0,font:!0,fontSize:!0,bold:!0,italic:!0,underline:!0,textColor:!0,fillColor:!0,border:!0,mergeCell:!0,horizontalAlignMode:!0,verticalAlignMode:!0,textWrapMode:!0,image:!0,chart:!0,sortAndFilter:!0,splitColumn:!0,findAndReplace:!0},cellRightClickConfig:{copy:!0,copyAs:!1,paste:!0,insertRow:!0,insertColumn:!0,deleteRow:!0,deleteColumn:!0,deleteCell:!0,hideRow:!1,hideColumn:!1,rowHeight:!0,columnWidth:!0,clear:!0,matrix:!1,sort:!0,filter:!1,chart:!0,image:!0,link:!0,data:!1,cellFormat:!0},showinfobar:!1,sheetFormulaBar:!1,showstatisticBar:!1}},getters:{},mutations:{changeTablehead(e,t){e.tableHead.title=t.title},changeSpliter(e,t){e.spliter=t},changeFilter(e,t){e.filter=t},changeGrouper(e,t){e.grouper=t},changeFormatter(e,t){e.formatter=t},changeReplace(e,t){e.replace=t},changeAppend(e,t){e.append=t},changeSplit(e,t){e.split=t},changeSort(e,t){e.sort=t},changePrinter(e,t){e.printer=t},changeLuckyrange(e,t){e.luckyRange=t}},actions:{},modules:{}})}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={id:r,loaded:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.loaded=!0,i.exports}n.m=e,function(){n.amdD=function(){throw new Error("define cannot be used indirect")}}(),function(){n.amdO={}}(),function(){var e=[];n.O=function(t,r,o,i){if(!r){var a=1/0;for(f=0;f<e.length;f++){r=e[f][0],o=e[f][1],i=e[f][2];for(var u=!0,l=0;l<r.length;l++)(!1&i||a>=i)&&Object.keys(n.O).every((function(e){return n.O[e](r[l])}))?r.splice(l--,1):(u=!1,i<a&&(a=i));if(u){e.splice(f--,1);var c=o();void 0!==c&&(t=c)}}return t}i=i||0;for(var f=e.length;f>0&&e[f-1][2]>i;f--)e[f]=e[f-1];e[f]=[r,o,i]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,r){return n.f[r](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+e+"."+{67:"04fa42ff",296:"21a9026d",440:"0f9e0090",788:"51708c33",804:"3ab18dad"}[e]+".js"}}(),function(){n.miniCssF=function(e){return"css/"+e+"."+{67:"10455eb2",296:"6c26427d",440:"409a3026",788:"881a731e",804:"7c720828"}[e]+".css"}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="reportforms:";n.l=function(r,o,i,a){if(e[r])e[r].push(o);else{var u,l;if(void 0!==i)for(var c=document.getElementsByTagName("script"),f=0;f<c.length;f++){var s=c[f];if(s.getAttribute("src")==r||s.getAttribute("data-webpack")==t+i){u=s;break}}u||(l=!0,u=document.createElement("script"),u.charset="utf-8",u.timeout=120,n.nc&&u.setAttribute("nonce",n.nc),u.setAttribute("data-webpack",t+i),u.src=r),e[r]=[o];var d=function(t,n){u.onerror=u.onload=null,clearTimeout(p);var o=e[r];if(delete e[r],u.parentNode&&u.parentNode.removeChild(u),o&&o.forEach((function(e){return e(n)})),t)return t(n)},p=setTimeout(d.bind(null,void 0,{type:"timeout",target:u}),12e4);u.onerror=d.bind(null,u.onerror),u.onload=d.bind(null,u.onload),l&&document.head.appendChild(u)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.nmd=function(e){return e.paths=[],e.children||(e.children=[]),e}}(),function(){n.p=""}(),function(){if("undefined"!==typeof document){var e=function(e,t,n,r,o){var i=document.createElement("link");i.rel="stylesheet",i.type="text/css";var a=function(n){if(i.onerror=i.onload=null,"load"===n.type)r();else{var a=n&&("load"===n.type?"missing":n.type),u=n&&n.target&&n.target.href||t,l=new Error("Loading CSS chunk "+e+" failed.\n("+u+")");l.code="CSS_CHUNK_LOAD_FAILED",l.type=a,l.request=u,i.parentNode&&i.parentNode.removeChild(i),o(l)}};return i.onerror=i.onload=a,i.href=t,n?n.parentNode.insertBefore(i,n.nextSibling):document.head.appendChild(i),i},t=function(e,t){for(var n=document.getElementsByTagName("link"),r=0;r<n.length;r++){var o=n[r],i=o.getAttribute("data-href")||o.getAttribute("href");if("stylesheet"===o.rel&&(i===e||i===t))return o}var a=document.getElementsByTagName("style");for(r=0;r<a.length;r++){o=a[r],i=o.getAttribute("data-href");if(i===e||i===t)return o}},r=function(r){return new Promise((function(o,i){var a=n.miniCssF(r),u=n.p+a;if(t(a,u))return o();e(r,u,null,o,i)}))},o={143:0};n.f.miniCss=function(e,t){var n={67:1,296:1,440:1,788:1,804:1};o[e]?t.push(o[e]):0!==o[e]&&n[e]&&t.push(o[e]=r(e).then((function(){o[e]=0}),(function(t){throw delete o[e],t})))}}}(),function(){var e={143:0};n.f.j=function(t,r){var o=n.o(e,t)?e[t]:void 0;if(0!==o)if(o)r.push(o[2]);else{var i=new Promise((function(n,r){o=e[t]=[n,r]}));r.push(o[2]=i);var a=n.p+n.u(t),u=new Error,l=function(r){if(n.o(e,t)&&(o=e[t],0!==o&&(e[t]=void 0),o)){var i=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.src;u.message="Loading chunk "+t+" failed.\n("+i+": "+a+")",u.name="ChunkLoadError",u.type=i,u.request=a,o[1](u)}};n.l(a,l,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,r){var o,i,a=r[0],u=r[1],l=r[2],c=0;if(a.some((function(t){return 0!==e[t]}))){for(o in u)n.o(u,o)&&(n.m[o]=u[o]);if(l)var f=l(n)}for(t&&t(r);c<a.length;c++)i=a[c],n.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return n.O(f)},r=self["webpackChunkreportforms"]=self["webpackChunkreportforms"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=n.O(void 0,[998],(function(){return n(53148)}));r=n.O(r)})();
//# sourceMappingURL=app.09aade5f.js.map