import{l as c,o as r,c as i,a as e,F as _,r as m,m as x,t as n,u as a,f as k,p as v,q as C}from"./index-Co07Sg7F.js";import{u as w}from"./index-C0PpGScN.js";/**
 * @license lucide-vue-next v1.0.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=c("circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-vue-next v1.0.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=c("square-check-big",[["path",{d:"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344",key:"2acyp4"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-vue-next v1.0.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=c("toggle-left",[["circle",{cx:"9",cy:"12",r:"3",key:"u3jwor"}],["rect",{width:"20",height:"14",x:"2",y:"5",rx:"7",key:"g7kal2"}]]);/**
 * @license lucide-vue-next v1.0.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=c("type",[["path",{d:"M12 4v16",key:"1654pz"}],["path",{d:"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",key:"e0r10z"}],["path",{d:"M9 20h6",key:"s66wpe"}]]),B={class:"page-container"},M={class:"card"},D=["onClick"],L={style:{display:"flex","align-items":"center"}},V={style:{width:"40px",height:"40px","border-radius":"50%","background-color":"#C8E6C9",display:"flex","align-items":"center","justify-content":"center","margin-right":"12px"}},j={style:{"font-size":"16px",color:"#333","font-weight":"500"}},q={style:{"font-size":"12px",color:"#666"}},P={__name:"CategoryPractice",setup(F){const p=k(),{categories:d,getQuestionsByCategory:h}=w(),g={single_choice:l,multiple_choice:b,true_false:E,fill_blank:z,short_answer:C};function y(t){return g[t]||l}function u(t){p.push(`/practice/${t}`)}return(t,o)=>(r(),i("div",B,[e("div",M,[o[1]||(o[1]=e("h2",{style:{color:"#2E7D32","font-size":"18px","font-weight":"600","margin-bottom":"16px"}},"题型专练",-1)),(r(!0),i(_,null,m(a(d),(f,s)=>(r(),i("div",{key:s,onClick:S=>u(s),style:{display:"flex","justify-content":"space-between","align-items":"center",padding:"16px 0","border-bottom":"1px dashed #E8E8E8",cursor:"pointer"}},[e("div",L,[e("div",V,[(r(),x(v(y(s)),{style:{width:"20px",height:"20px",color:"#2E7D32"}}))]),e("div",null,[e("div",j,n(f.name),1),e("div",q,"共 "+n(a(h)(s).length)+" 题",1)])]),o[0]||(o[0]=e("span",{style:{color:"#999"}},">",-1))],8,D))),128))])]))}};export{P as default};
