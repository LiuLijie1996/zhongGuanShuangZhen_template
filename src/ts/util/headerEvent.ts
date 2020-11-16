class HeaderEvent {
    private searchShow: boolean = false;
    private navShow: boolean = false;
    private readonly userInfo;

    constructor() {
        /*获取用户信息*/
        let userInfo = localStorage.getItem("userInfo");
        this.userInfo = userInfo ? JSON.parse(userInfo) : "";

        //初始化
        this.initialize();
    }

    //初始化
    private initialize() {
        /*PC端事件*/
        this.PcEvent();

        /*移动端事件*/
        this.mobileEvent();
    }

    /*移动端事件集合*/
    private mobileEvent() {
        let _this = this;

        //移动端点击搜索图标
        $(".hideBox .layui-icon-search").on("click", () => {
            this.searchShow = !this.searchShow;
            this.ShowSearch(this.searchShow)
        });

        //移动端点击菜单图标
        $(".hideBox .layui-icon-shrink-right").on("click", () => {
            this.navShow = !this.navShow;
            this.ShowNav(this.navShow)
        });

        $(document).on("click", (e) => {
            if (!this.navShow) return;
            parent($(e.target));

            function parent(ele: any) {
                let parentClass = ele.attr("class");
                //如果到了顶层对象了，就强制等于false
                if (parentClass === "layui-icon layui-icon-shrink-right") {
                    return;
                } else if (ele[0] === document) {
                    _this.navShow = false;
                    _this.ShowNav(_this.navShow)
                } else if (parentClass !== 'navList') {
                    parent(ele.parent());
                }
            }
        });
    }

    //移动端控制搜索框的显示隐藏
    private ShowSearch(isShow: boolean) {
        //true为显示
        if (isShow) {
            $(".hideBox .searchInput").css({
                top: "0.42rem",
                opacity: 1,
            })
        } else {
            $(".hideBox .searchInput").css({
                top: "-0.42rem",
                opacity: 0,
            })
        }
    }

    //移动端控制导航的显示隐藏
    private ShowNav(isShow: boolean) {
        //隐藏搜索框
        this.searchShow = false;
        this.ShowSearch(false);

        //true为显示导航
        if (isShow) {
            $(".hideBox .navList").css({
                right: 0,
            })
        } else {
            $(".hideBox .navList").css({
                right: "-100%",
            })
        }
    }

    /*移动端事件集合*/
    private PcEvent() {
        /*设置头部用户信息*/
        this.PcSetHeaderInfo();
    }

    /*设置头部用户信息*/
    private PcSetHeaderInfo(){
        if (this.userInfo) {
            $(".loginBox .isShow").css({
                display:"none",
            });

            $(".loginBox .isHide").css({
                display:"inline-block",
            });
            $(".loginBox .isHide img").attr('src', this.userInfo.photo);
            $(".loginBox .isHide span.userName").text(this.userInfo.userName);
        }
    }
}

new HeaderEvent();
