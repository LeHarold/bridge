export function today(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function followingDay(day){const [y,m,d]=day.split('-').map(Number);return today(new Date(y,m-1,d+1,12))}
export function status(r){return !r.lastAttempt?'new':r.streak>=3?'green':r.streak>0?'yellow':'red'}
export function period(d=new Date()){return d.getHours()<12?'morning':d.getHours()<18?'afternoon':'evening'}
export function grade(record,correct,day=today(),session=period()){
 const r={...record,tags:record.tags||[],lastAttempt:day};
 const slot=day+'-'+session;
 if(!correct){r.streak=0;r.lastCorrect=null;r.due=followingDay(day)}
 else {if(r.lastCorrectSlot!==slot){r.streak=Math.min(3,(r.streak||0)+1);r.lastCorrect=day;r.lastCorrectSlot=slot}r.due=r.streak>=3?null:followingDay(day)}
 return r;
}
