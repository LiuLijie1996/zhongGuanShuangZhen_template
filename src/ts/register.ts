import "../scss/register.scss";
import {controller} from "./decorator";

@controller
class Register {
    private preAddClassInput = $(".itemOn")[0];//上次加类名的输入框父类
    private getVerifyCodeTime: number = 60;//获取验证码时的倒计时
    private getVerifyCodeBtn: any = null;//被点击的获取验证码的按钮
    private setInt: any = null;//定时器

    constructor() {
        window.onload = () => {
            //初始化
            this.initialize();
        };
    }

    /*初始化*/
    private initialize() {
        let _this = this;

        /*点击tab栏事件*/
        $(".layui-tab-title li").on('click', function () {
            document.title = $(this).text();
        });

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

        /*点击忘记密码事件*/
        $('.wangJi').on('click', function () {
            layui.use(['element', 'form', 'layer'], function () {
                let layer = layui.layer;

                /*忘记密码弹窗*/
                layer.open({
                    type: 1,
                    title: "修改密码",
                    area: ['500px'],
                    content: layui.$('#hideForm')
                });
            });
        });

        /*新用户注册点击获取验证码时触发*/
        $(".getVerifyCodeBtn").on("click", function () {
            //判断当前点击的按钮和上次是否相同，如果不相同则获取验证码
            if (_this.getVerifyCodeTime === 0 || this !== _this.getVerifyCodeBtn) {
                /*清除上次的定时器*/
                clearInterval(_this.setInt);
                /*重置时间*/
                _this.getVerifyCodeTime = 60;
                /*恢复上次按钮的文本*/
                _this.getVerifyCodeBtn && $(_this.getVerifyCodeBtn).text("获取验证码");
                /*记录当前按钮*/
                _this.getVerifyCodeBtn = this;
                /*设置按钮显示的文本*/
                _this.setBtnText();
                /*开始倒计时*/
                _this.setDaoJiShi();

                /*触发请求回调*/
                // @ts-ignore
                window.page && window.page.getVerifyCode();
            }
        });

        /*layui相关事件*/
        this.layuiEvent();
    }

    /*设置倒计时*/
    private setDaoJiShi() {
        //开始倒计时
        this.setInt = setInterval(() => {
            this.getVerifyCodeTime--;

            //设置按钮的显示内容
            this.setBtnText();

            if (this.getVerifyCodeTime <= 0) {
                clearInterval(this.setInt);//清除倒计时
            }
        }, 1000);
    }

    /*设置获取验证码的按钮内容*/
    private setBtnText() {
        let time = this.getVerifyCodeTime <= 9 ? '0' + this.getVerifyCodeTime : this.getVerifyCodeTime;
        $(this.getVerifyCodeBtn).text(this.getVerifyCodeTime === 0 ? "获取验证码" : "获取验证码(" + time + ")");
    }

    /*layui相关事件*/
    private layuiEvent() {
        layui.use(['layer', 'form', 'element'], function () {
            var form = layui.form;
            var layer = layui.layer;

            //自定义验证规则
            form.verify({
                password1: function (value: any) {
                    if (value.length < 5) {
                        return '密码至少5个字符';
                    }
                },
                password2: function (value: any) {
                    let password1 = $("input[lay-verify=password1]").val();
                    if (value !== password1) {
                        return '两次密码不一致';
                    }
                },
            });


            //监听登录提交
            form.on('submit(loginDemo)', function (data) {
                // @ts-ignore
                window.page && window.page.loginDemo(data.field);
                return false;
            });


            //监听注册提交
            form.on('submit(registerDemo)', function (data) {
                // @ts-ignore
                window.page && window.page.registerDemo(data.field);
                return false;
            });


            //监听忘记密码提交
            form.on('submit(forgetPwdDemo)', function (data) {
                // @ts-ignore
                window.page && window.page.forgetPwdDemo(data.field);
                return false;
            });
        });
    }
}
