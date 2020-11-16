import "./util/remjs";
import "./util/headerEvent";
import "../scss/personalCenter.scss";
import {controller} from "./decorator/index";

//个人中心
@controller
class PersonalCenter {
    private preSelectTabBar: any = $(".tabBar .select")[0];//默认选择的tab
    private preShowTable: any;//默认上次显示的表格
    private preAddClassInput = $(".itemOn")[0];//上次加类名的输入框父类

    constructor() {
        window.onload = () => {
            //初始化
            this.initialize();
        }
    }

    //初始化
    private initialize() {
        /*tabBar点击事件*/
        this.TabBarClickEvent();

        /*修改资料点击事件*/
        this.PopUpEvent();

        /*form表单点击事件*/
        this.inputFormClickEvent();
    }

    /*tabBar点击事件*/
    private TabBarClickEvent() {
        let _this = this;
        let tabBarList = $(".tabBar p");
        let tabBarTable = $(".rightBox .tabBarTable");
        for (let i = 0; i < tabBarList.length; i++) {
            let tabBarItem = tabBarList[i];

            if (tabBarItem === this.preSelectTabBar) {
                //记录默认显示的表格
                this.preShowTable = tabBarTable[i];
                /*显示对应的表格*/
                $(this.preShowTable).css({
                    display: "block",
                });
            }

            $(tabBarItem).on('click', function () {
                /*清除上次选择的*/
                $(_this.preSelectTabBar).removeClass("select");
                /*给当前元素添加类名*/
                $(this).addClass("select");
                /*记录当前元素*/
                _this.preSelectTabBar = this;

                /*关闭上次的表格*/
                $(_this.preShowTable).css({
                    display: "none",
                });

                /*显示对应的表格*/
                $(tabBarTable[i]).css({
                    display: "block",
                });

                /*记录当前显示的表格*/
                _this.preShowTable = tabBarTable[i];
            });
        }
    }

    /*修改资料点击事件*/
    private PopUpEvent() {
        layui.use(['element', 'form', 'layer'], function () {
            let form = layui.form;
            let layer = layui.layer;

            /*修改资料弹窗*/
            $(".updateInfoBtn button").on('click', function () {
                /*修改资料弹窗*/
                layer.open({
                    type: 1,
                    title: "修改资料",
                    area: ['500px'],
                    content: layui.$('#hideForm')
                });
            });

            /*物流信息弹窗*/
            $(".viewWuLiu").on('click', function () {
                /*物流信息弹窗*/
                layer.open({
                    type: 1,
                    title: "物流信息",
                    area: ['500px', '500px'],
                    content: layui.$('#showWuLiuInfo')
                });
            });

            //自定义验证规则
            form.verify({
                password1: function (value: any) {
                    if (value.length < 5) {
                        return '密码至少5个字符';
                    }
                },
                password2: function (value: any) {
                    let password1 = $("input[name=password1]").val();
                    if (value !== password1) {
                        return '两次密码不一致';
                    }
                },
            });

            //监听修改资料提交
            form.on('submit(updateInfo)', function (data) {
                layer.closeAll();
                // @ts-ignore
                window.page && window.page.affirmUpdateInfo(data.field);

                return false;
            });
        });
    }

    /*form表单点击事件*/
    private inputFormClickEvent() {
        let _this = this;

        /*输入框获取焦点事件*/
        let inputList = $(".layuiFormItemInput input");
        let layuiFormItem = $(".layuiFormItemInput");
        for (let i = 0; i < inputList.length; i++) {
            let inputItem = inputList[i];
            $(inputItem).on("focus", function () {
                /*删除上次添加类名的输入框父类*/
                $(_this.preAddClassInput).removeClass("itemOn");
                /*给当前添加类名*/
                $(layuiFormItem[i]).addClass("itemOn");
                /*记录当前添加类名的元素*/
                _this.preAddClassInput = $(layuiFormItem[i])[0];
            });
        }

        /*输入框失去焦点事件*/
        $(".layuiFormItemInput input").on("blur", function () {
            /*删除上次添加类名的输入框父类*/
            $(_this.preAddClassInput).removeClass("itemOn");
        });
    }
}
