import "./util/remjs";
import "./util/headerEvent";
import "../scss/newsInformation.scss";
import {controller} from "./decorator/index";
import BScroll from "better-scroll";

//新闻资讯
@controller
class NewsInformation{
    private preSelectNav: any = $(".navList .nav-this")[0];//上次选择的导航
    private preSelectNavX: any = $("#wrapper .content .nav-this")[0];//上次选择的X轴的导航
    private myScroll: any;

    constructor() {
        this.initialize();
    }
    //初始化
    private initialize() {
        /*导航点击事件*/
        this.navClickEvent();

        /*设置滚动组件wrapper中的content宽度*/
        this.setContentWidth();

        /*导航滚动组件*/
        this.navScroll();

        /*横轴的导航点击事件*/
        this.XNavClickEvent();
    }

    /*导航点击事件*/
    private navClickEvent() {
        let _this = this;
        $(".navList .navItem").on("click", function () {
            /*删除上次添加的类名*/
            $(_this.preSelectNav).removeClass("nav-this");
            //给当前点击的导航添加类名
            $(this).addClass("nav-this");
            /*记录当前加类名的元素*/
            _this.preSelectNav = this;
        });
    }

    /*设置滚动组件wrapper中的content宽度*/
    private setContentWidth() {
        let list = $(".hideNavList #wrapper .content li");
        let allWidth = 0;
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let width = Number($(item).width());
            let paddingLeft = Number($(item).css('paddingLeft').split("px")[0]);
            let paddingRight = Number($(item).css('paddingRight').split("px")[0]);
            let marginLeft = Number($(item).css('marginLeft').split("px")[0]);
            let marginRight = Number($(item).css('marginRight').split("px")[0]);
            allWidth += width + paddingLeft + paddingRight + marginLeft + marginRight;
        }

        $("#wrapper .content").css({
            width: allWidth + 'px',
        })
    }

    /*导航滚动组件*/
    private navScroll() {
        let wrapper = $("#wrapper")[0];
        this.myScroll = new BScroll(wrapper, {
            click: true,//是否可以点击
            scrollY: false,//纵向滚动
            scrollX: true,
        });
    }

    /*横轴的导航点击事件*/
    private XNavClickEvent() {
        let _this = this;
        let list = $(".hideNavList #wrapper .content li");
        list.on("click", function (e, x) {
            /*删除上次添加的类名*/
            $(_this.preSelectNavX).removeClass("nav-this");
            //给当前点击的导航添加类名
            $(this).addClass("nav-this");
            /*记录当前加类名的元素*/
            _this.preSelectNavX = this;


            let scrollX = 0;
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                let ele: any = $(this)[0];
                if (ele === item) {
                    //判断是否已经到了最大值了
                    if (scrollX < _this.myScroll.maxScrollX) {
                        //如果到达最大值，直接滚动到最后
                        _this.myScroll.scrollTo(_this.myScroll.maxScrollX, 0, 1000);
                        return ;
                    }
                    _this.myScroll.scrollTo(scrollX, 0, 1000);
                    break;
                }

                scrollX -=  Number($(item).width());
            }
        });
    }
}
