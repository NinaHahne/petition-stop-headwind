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

    $canvas.on("mouseenter", () => {
        $canvas.on("mousedown", e => {
            startSignature(e);
            $canvas.on("mousemove", e => {
                drawLine(e);
            });
        });

        $canvas.on("mouseup", e => {
            saveSignature(e);
            $canvas.unbind('mousemove');
        });

        $canvas.on("mouseleave", () => {
            $canvas.unbind('mousemove');
        });
    });

}

function startSignature(e) {
    console.log("signature started");
    mouseXstart = e.pageX - e.target.offsetLeft;
    mouseYstart = e.pageY - e.target.offsetTop;
}

function saveSignature() {
    // let dataURL = canvas.toDataURL();
    // console.log(dataURL);
    sigInput.value = canvas.toDataURL();
}

function drawLine(e) {
    mouseX = e.pageX - e.target.offsetLeft;
    mouseY = e.pageY - e.target.offsetTop;

    ctx.beginPath();
    ctx.moveTo(mouseXstart, mouseYstart);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();

    mouseXstart = mouseX;
    mouseYstart = mouseY;
}
