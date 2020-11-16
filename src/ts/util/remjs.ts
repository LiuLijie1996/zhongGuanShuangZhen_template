// 打开页面的时候先执行一次
fixLayout();
$(window).on('resize', fixLayout);
function fixLayout(){
    const widthStr = $('html').css('width').split('px')[0];//获取客户端宽度
    const fontSize = Number(widthStr) / 3.75 + 'px';
    $('html').css({
        fontSize: fontSize,
    })
}
