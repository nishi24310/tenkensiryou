let currentData={};
const { jsPDF }=window.jspdf;

// 一意ID発行
function generateId() {
  return `TEN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*99999)}`;
}

// JSON保存（ダウンロード）
function saveData() {
  const id=generateId();
  currentData.id=id;
  currentData.savedAt=new Date().toISOString();
  const blob=new Blob([JSON.stringify(currentData)], {type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=`tenken_${id}.json`;
  a.click();
  URL.revokeObjectURL(url);
  document.getElementById("inspectId").textContent=`ID: ${id}`;
  new QRCode(document.getElementById("qrcode"), {text: id, width:100, height:100});
  alert("ID発行＆JSONファイルを保存しました");
}

// JSON読込・復元
function loadData() {
  const file=document.getElementById("loadFile").files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try {
      currentData=JSON.parse(e.target.result);
      alert(`ID: ${currentData.id} のデータを復元しました`);
      document.getElementById("inspectId").textContent=`ID: ${currentData.id}`;
    } catch { alert("ファイル形式が不正です"); }
  };
  reader.readAsText(file);
}

// PDF作成（写真有無切替）
function makePdf(withPhoto=false) {
  const doc=new jsPDF();
  doc.setFontSize(12);
  doc.text(`点検ID: ${currentData.id||"未発行"}`, 10, 15);
  doc.text("点検日: "+new Date().toLocaleDateString("ja-JP"), 10, 25);
  // ここに点検項目・コメントを記載
  if(withPhoto && currentData.photos) {
    let y=40;
    currentData.photos.forEach((p,i)=>{ doc.addImage(p,"JPEG",10,y,80,60); y+=65; });
  }
  doc.save(`点検報告書_${currentData.id||"新規"}${withPhoto?"_写真付":"_本文"}.pdf`);
}

// 写真圧縮登録
function addPhoto(file, fieldKey) {
  const canvas=document.createElement("canvas");
  const ctx=canvas.getContext("2d");
  const img=new Image();
  img.onload=()=>{
    canvas.width=800;
    canvas.height=img.height*800/img.width;
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    if(!currentData.photos) currentData.photos={};
    canvas.toBlob(blob=>{
      const reader=new FileReader();
      reader.onload=e=> currentData.photos[fieldKey]=e.target.result;
      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.7);
  };
  img.src=URL.createObjectURL(file);
}
