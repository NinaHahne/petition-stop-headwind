// canvas stuff
// console.log('yay canvas');

const $canvas = $("#canvas");
const canvas = document.getElementById("canvas");
const sigInput = document.getElementById("sig");

let ctx;
let mouseX, mouseY, mouseXstart, mouseYstart;

if (canvas) {
    ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;

    ctx.strokeStyle = "midnightblue";

    $canvas.on("mousedown", e => {
        startSignature(e);
        $canvas.on("mousemove", e => {
            drawLine(e);
        });
    });

    $canvas.on("mouseup", e => {
        saveSignature(e);
    });

}

function startSignature() {
    console.log("signature started");
    // mouseX = e.pageX - e.target.offsetLeft;
    // mouseY = e.pageY - e.target.offsetTop;
    // console.log("mouseX: ", mouseX);
    // console.log("mouseY: ", mouseY);
    // ctx.beginPath();
    // ctx.arc(mouseX, mouseY, 20, 0, 2 * Math.PI);
    // ctx.stroke();
}

function saveSignature() {
    // let dataURL = canvas.toDataURL();
    // console.log(dataURL);
    sigInput.value = canvas.toDataURL();
    $canvas.unbind('mousemove');
}

function drawLine(e) {
    mouseXstart = mouseX;
    mouseYstart = mouseY;

    mouseX = e.pageX - e.target.offsetLeft;
    mouseY = e.pageY - e.target.offsetTop;

    ctx.beginPath();
    ctx.moveTo(mouseXstart, mouseYstart);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
}
