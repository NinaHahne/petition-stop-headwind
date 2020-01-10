// canvas stuff
// console.log('yay canvas');

const $canvas = $('#canvas');

const canvas = document.getElementById('canvas');
const sigInput = document.getElementById('sig');
let ctx;

if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;

    ctx.strokeStyle = "midnightblue";

    $canvas.on('mousedown', e => {
        startSignature(e);
    });

    $canvas.on('mouseup', e => {
        saveSignature(e);
    });

}

function startSignature (e) {
    console.log('signature started');
    let mouseX = e.pageX - e.target.offsetLeft;
    let mouseY = e.pageY - e.target.offsetTop;
    console.log('mouseX: ', mouseX);
    console.log('mouseY: ', mouseY);
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 20, 0, 2 * Math.PI);
    ctx.stroke();
}

function saveSignature (e) {
    // let dataURL = canvas.toDataURL();
    // console.log(dataURL);
    sigInput.value = canvas.toDataURL();
}
