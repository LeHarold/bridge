export function today(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function followingDay(day){const [y,m,d]=day.split('-').map(Number);return today(new Date(y,m-1,d+1,12))}
export function status(r){return !r.lastAttempt?'new':r.streak>=3?'green':r.streak>0?'yellow':'red'}
export function period(d=new Date()){return d.getHours()<12?'morning':d.getHours()<18?'afternoon':'evening'}
export function grade(record,correct,day=today(),session=period()){
 const monday=weekDates(day)[0];
 const firstAttempt=[record.weeklyAttempt,record.lastAttempt].find(date=>date>=monday&&date<=day)||day;
 const r={...record,tags:record.tags||[],lastAttempt:day,weeklyAttempt:firstAttempt};
 const slot=day+'-'+session;
 if(!correct){r.streak=0;r.lastCorrect=null;r.due=followingDay(day)}
 else {if(r.lastCorrectSlot!==slot){r.streak=Math.min(3,(r.streak||0)+1);r.lastCorrect=day;r.lastCorrectSlot=slot}r.due=r.streak>=3?null:followingDay(day)}
 return r;
}

export function weekDates(day=today()){
 const [year,month,date]=day.split('-').map(Number);
 const start=new Date(year,month-1,date,12);
 start.setDate(start.getDate()-(start.getDay()+6)%7);
 const days=[today(start)];
 while(days.length<7)days.push(followingDay(days.at(-1)));
 return days;
}
export function weeklyPlan(goal,attempts,day=today(),studyDays=[0,1,2,3,4,5,6]){
 const days=weekDates(day);
 const counts=days.map(date=>attempts.filter(attempt=>attempt===date).length);
 const completed=counts.reduce((total,count)=>total+count,0);
 let remaining=Math.max(0,goal-completed);
 const schedule=days.map((date,index)=>{
  const eligible=days.slice(index).filter((value,offset)=>value>=day&&studyDays.includes(index+offset)).length;
  const extra=date<day||!studyDays.includes(index)||!eligible?0:Math.ceil(remaining/eligible);
  remaining-=extra;
  return {date,done:counts[index],target:counts[index]+extra};
 });
 return {completed,schedule,todayTarget:schedule.find(item=>item.date===day).target};
}
