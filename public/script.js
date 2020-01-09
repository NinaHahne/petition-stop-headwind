// canvas stuff
// console.log('yay canvas');

const $canvas = $('#canvas');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

$canvas.on('mousedown', e => {
    console.log('signature started');
    let mouseX = e.pageX - e.target.offsetLeft;
    let mouseY = e.pageY - e.target.offsetTop;
    console.log('mouseX: ', mouseX);
    console.log('mouseY: ', mouseY);
});
