import "./util/remjs";
import "../scss/userBasicInfo.scss";
import {controller} from "./decorator";

@controller
class UserBasicInfo {
    private preAddClassInput = $(".itemOn")[0];//上次加类名的输入框父类

    constructor() {
        window.onload = () => {
            //初始化
            this.initialize();
        };
    }

    /*初始化*/
    private initialize() {
        /*layui事件*/
        this.layuiEvent();

        /*form表单点击事件*/
        this.inputFormClickEvent();
    }

    /*form表单点击事件*/
    private inputFormClickEvent(){
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

    /*layui事件*/
    private layuiEvent() {
        layui.use(['form', 'element'], function () {
            var form = layui.form;

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


            //监听登录提交
            form.on('submit(updateInfo)', function (data) {
                // @ts-ignore
                window.page && window.page.affirmUpdateInfo(data.field);
                return false;
            });
        });
    }
}
