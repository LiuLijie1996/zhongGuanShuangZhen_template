import "./util/remjs";
import "./util/headerEvent";
import "../scss/productDetails.scss";
import {controller} from "./decorator/index";
/* Swiper */
import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';
import BScroll from "better-scroll";
import QRCode from "qrcode";

//选中的商品对应的数据类型
interface checkedShopItem {
    id: string;//id
    title: string;//标题
    price: number;//价格
    subtotalPrice: number;//小计
    num: number;//数量
    masterImg: string;//主图
    freight: number;//运费
}

//后台返回的购物车的商品
interface ShopCarProduct {
    id: string;//产品id
    product_title: string;//产品标题
    xiaoJi: string;//产品小计
    product_price: string;//产品单价
    product_num: string;//产品加购数量
    product_imgurl: string;//产品主图
    freight: string;//产品运费
}

@controller
class ProductDetails {
    private shopCartScroll: any;//购物车滚动
    private dingDanScroll: any;//订单滚动
    private mySwiper: any;
    private selectGoods: checkedShopItem[] = [];//所有被选择的商品
    private inputCheckAll: any = [];//所有复选框

    constructor() {
        window.onload = () => {
            //初始化
            this.initialize();
        };
    }

    private initialize() {
        /*移动端事件*/
        this.mobileEvent();

        /*PC端点击事件*/
        this.PcClickEvent();
    }

    /*移动端事件*/
    private mobileEvent() {
        /*移动端设置轮播*/
        this.mobileSetBanner();
    }

    /*移动端设置轮播*/
    private mobileSetBanner() {
        let windowWidth = $(window).width();
        if (Number(windowWidth) <= 750) {
            this.mySwiper = new Swiper('.swiper-container', {
                loop: true,
                autoplay: true,
                observer: true,
                observeParents: true,
            });
        }
    }


    /*pc端点击事件*/
    private PcClickEvent() {
        /*点击立即购买*/
        $("#promptlyBuy").on('click', () => {
            /*给复选框绑定事件*/
            this.InputBindingEvent();

            //清空选择的商品
            this.selectGoods = [];

            //获取当前商品信息
            let goodsInfo = this.getCurrentGoodsInfo();
            this.selectGoods.push(goodsInfo);

            /*显示购物车和订单页面的父级*/
            this.isShowShoppingTrolley(true);
            /*隐藏购物车页面*/
            this.isShowShopCart(false);
            /*显示支付订单页面*/
            this.isShowPayDingDan(true);
            /*计算总金额*/
            this.computePrice(false);
            /*实例化订单滚动组件*/
            this.initializeDingDanScroll();

            // @ts-ignore
            window.page.PcClickGouMai.call(this, goodsInfo);
        });

        /*点击加入购物车*/
        $("#pushShopCart").on('click', () => {
            //获取当前商品信息
            let goodsInfo = this.getCurrentGoodsInfo();
            // @ts-ignore  加入购物车后得到所有购物车的商品
            window.page.PcClickJiaRuGouWuChe.call(this, goodsInfo, (goodsList) => {
                let productList: ShopCarProduct[] = goodsList;

                //填充数据到页面
                this.appendShopDocument(productList);
                //实例化购物车滚动组件
                this.initializeShopCartScroll();

                /*获取选中的商品*/
                this.selectGoods = this.getCheckedGoods();

                /*显示购物车和订单页面的父级*/
                this.isShowShoppingTrolley(true);
                /*显示购物车页面*/
                this.isShowShopCart(true);
                /*隐藏支付订单页面*/
                this.isShowPayDingDan(false);
                /*计算总金额*/
                this.computePrice(true);
                /*实例化购物车滚动组件*/
                this.initializeShopCartScroll();

                /*给复选框绑定事件*/
                this.InputBindingEvent();
                /*给增加按钮和减少绑定点击事件*/
                this.JiaBtnBindingEvent();
            });
        });

        /*点击加入购物车*/
        $(".mobileJoinShopCart").on('click', () => {
            //获取当前商品信息
            let goodsInfo = this.getCurrentGoodsInfo();
            // @ts-ignore
            window.page.MobileJoinShopCart(goodsInfo);
        });

        /*点击隐藏购物车页面*/
        $("#shoppingTrolley .header .hideShopCart").on('click', () => {
            //隐藏购物车
            this.isShowShoppingTrolley(false);
        });

        /*点击全选*/
        $("#checkAll").on('click', () => {
            //获取所有复选框
            this.inputCheckAll = $(".shopList #BScroll .item input");
            //遍历复选框
            for (let i = 0; i < this.inputCheckAll.length; i++) {
                let item = this.inputCheckAll[i];
                //将复选框全部选中
                $(item).prop("checked", true);
                /*获取当前商品*/
                let goodsItem: checkedShopItem = this.getCheckInputGoods(i);
                /*添加到selectGoods*/
                this.isPushGoods(true, goodsItem);
            }
            /*计算总金额*/
            this.computePrice(true);
        });

        /*点击删除*/
        $("#delete").on("click", () => {
            this.inputCheckAll = $(".shopList #BScroll .item input");//获取所有复选框
            let shopList = $(".shopList #BScroll .list .item");//商品列表

            //等待删除的元素
            let awaitDelete = [];
            //删除掉的商品
            let delShopCart = [];

            for (let i = 0; i < this.inputCheckAll.length; i++) {
                //当前复选框是否选则了
                let check = $(this.inputCheckAll[i]).is(":checked");
                //当前复选框对应的元素
                let shopItem = shopList[i];
                //判断当前复选框是否选则了
                if (check) {
                    /*获取当前复选框对应的数据*/
                    let goodsItem = this.getCheckInputGoods(i);
                    delShopCart.push(goodsItem);
                    //先删除对应的数据
                    this.isPushGoods(false, goodsItem);
                    //收集待删除的元素
                    awaitDelete.push(shopItem);
                }

                /*后删除选中的元素*/
                if (i === this.inputCheckAll.length - 1) {
                    awaitDelete.forEach(item => {
                        $(".shopList #BScroll .list").find(item).remove();
                    });
                }
            }

            //请求删除
            // @ts-ignore
            window.page.PcClickProduct.call(this, delShopCart);

            /*重新给复选框绑定事件*/
            this.InputBindingEvent();
            /*重新给增加按钮和减少绑定点击事件*/
            this.JiaBtnBindingEvent();
            /*重新计算总金额和数量*/
            this.computePrice(true);
            /*实例化购物车滚动组件*/
            this.initializeShopCartScroll();
        });

        /*点击结算*/
        $(".jieSuan").on('click', () => {
            if (this.selectGoods.length === 0) {
                // @ts-ignore
                layui.use('layer', () => {
                    // @ts-ignore
                    let layer = layui.layer;
                    layer.msg('最少选择一件商品', {icon: 5});
                });
            } else {
                /*显示购物车和订单页面的父级*/
                this.isShowShoppingTrolley(true);
                /*隐藏购物车页面*/
                this.isShowShopCart(false);
                /*显示支付订单页面*/
                this.isShowPayDingDan(true);
                /*计算总金额*/
                this.computePrice(false);
                /*实例化订单滚动组件*/
                this.initializeDingDanScroll();
            }
        });

        /*点击返回上一页，显示购物车*/
        $("#shoppingTrolley .drawer .hideBottomBtn .goBackShowCart").on('click', () => {
            /*给复选框绑定事件*/
            this.InputBindingEvent();
            /*给增加按钮和减少绑定点击事件*/
            this.JiaBtnBindingEvent();

            /*获取选中的商品*/
            this.selectGoods = this.getCheckedGoods();
            /*显示购物车页面*/
            this.isShowShopCart(true);
            /*隐藏支付订单页面*/
            this.isShowPayDingDan(false);
            /*计算总金额*/
            this.computePrice(true);
            /*实例化购物车滚动组件*/
            this.initializeShopCartScroll();
        });

        /*点击修改地址*/
        let time = 0;
        $("#shoppingTrolley .drawer .updateLocationBtn").on('click', () => {
            if (new Date().getTime() - time > 1000) {
                // @ts-ignore
                layui.use(['layer', 'form'], () => {
                    // @ts-ignore
                    let layer = layui.layer;
                    // @ts-ignore
                    let form = layui.form;
                    //弹窗
                    layer.open({
                        type: 1,
                        title: "修改收货信息",
                        area: ['500px'],
                        content: $('#formBox'),
                        cancel(index: any) {
                            $('#formBox').css({
                                display: "none",
                            })
                        }
                    });

                    //自定义验证规则
                    form.verify({
                        phone: function (value: any) {
                            if (!/^1[3-9]\d{9}$/.test(value)) {
                                return '手机号码有误，请重填';
                            }
                        },
                    });

                    //监听提交
                    form.on('submit(submitInfo)', (data: any) => {
                        //关闭所有弹窗
                        layer.closeAll();
                        $('#formBox').css({
                            display: "none",
                        });

                        $("#BScroll2 .userName").html(data.field.userName);
                        $("#BScroll2 .phone").html(data.field.phone);
                        $("#BScroll2 .location").html(data.field.receivingSite);

                        // @ts-ignore
                        window.page.PcUpdateLocationSubmit && window.page.PcUpdateLocationSubmit.call(this, data.field);
                        return false;
                    });
                });

                time = new Date().getTime();
            }
        });

        /*点击支付方式事件*/
        $("#shoppingTrolley .drawer .hideBottomBtn .payType span").on('click', function () {
            $("#shoppingTrolley .drawer .hideBottomBtn .payType span").removeClass("on");
            $(this).addClass("on");
        });

        /*点击提交订单事件*/
        $("#shoppingTrolley .drawer .hideBottomBtn .submitDingDan").on('click', () => {
            let payType = $("#shoppingTrolley .drawer .hideBottomBtn .payType span.on").text();

            let payGoods = {
                payType: payType === '微信' ? 1 : 2,
                selectGoods: this.selectGoods,
            };
            // @ts-ignore
            window.page.PcSubmitDingDan(payGoods, (payData) => {
                console.log(payData);
                payData && QRCode.toDataURL(payData.codeUrl, {errorCorrectionLevel: 'H'}, function (err, url) {
                    $("#payPopUp .pull-left").html("订单号：" + payData.orderNum);
                    $("#payPopUp .pull-right").html("总金额：" + payData.totalPrice);
                    $("#payPopUp .payType").html(payType);
                    $("#payPopUp .codeImg").attr('src', url);

                    layui.use('layer', function () {
                        let layer = layui.layer;

                        layer.open({
                            type: 1,
                            title: "支付信息",
                            area: ["550px"],
                            content: $('#payPopUp'),
                            cancel(index: any) {
                                $('#payPopUp').css({
                                    display: "none",
                                })
                            }
                        });
                    });
                });
            });
        });

        /*移动端点击立即购买*/
        $("#addShop .promptly .mobilePromptlyBuy").on("click", ()=>{
            //获取当前商品信息
            let goodsInfo = this.getCurrentGoodsInfo();
            // @ts-ignore
            window.page.MobilePromptlyBuy(goodsInfo);
        });
    }

    /*获取当前商品信息*/
    private getCurrentGoodsInfo() {
        /*获取当前商品信息*/
        let id = $("#PC .specification .right .btn").attr('data-id');//id
        let freight = $("#PC .specification .right .btn").attr('data-freight');//运费
        let title = $("#PC .specification .right .title").text();//标题
        let price = $("#PC .specification .right .price span").text();//价格
        let masterImg = $("#PC .specification .left .masterImg img").attr('src');//主图
        //商品信息
        let goodsInfo: checkedShopItem = {
            id: String(id),
            freight: Number(freight),
            title,
            subtotalPrice: Number(price),
            num: 1,
            price: Number(price),
            masterImg: String(masterImg),
        };
        return goodsInfo;
    }

    /*显示隐藏 购物车/订单结算 的父级*/
    private isShowShoppingTrolley(isShow: boolean) {
        if (isShow) {
            //显示

            $("#shoppingTrolley").css({
                display: "block",
            });
            setTimeout(() => {
                $("#shoppingTrolley").css({
                    opacity: 1,
                });
                //显示购物车
                $("#shoppingTrolley .drawer").css({
                    transform: "translateX(0%)",
                });
            }, 100);
        } else {
            //隐藏

            $("#shoppingTrolley").css({
                opacity: 0,
            });
            $("#shoppingTrolley .drawer").css({
                transform: "translateX(100%)",
            });

            setTimeout(() => {
                $("#shoppingTrolley").css({
                    display: "none",
                });
            }, 200);
        }
    }

    //显示隐藏订单结算页面
    private isShowPayDingDan(isShow: boolean) {
        /*结算页面*/
        $("#BScroll2").css({
            display: isShow === true ? "block" : "none",
        });

        /*默认隐藏的头部*/
        $("#shoppingTrolley .drawer .hideHeader").css({
            display: isShow === true ? "block" : "none",
        });

        /*默认隐藏的头部*/
        $("#shoppingTrolley .drawer .hideBottomBtn").css({
            display: isShow === true ? "block" : "none",
        });

        if (isShow) {
            $("#BScroll2 #scrollSettlement .settlementShopList").html("");

            //填充数据到订单结算页
            let html = "";
            this.selectGoods.forEach(item => {
                let settlementItem = `<div class="settlementItem">
                    <!--主图-->
                    <div class="left">
                        <div class="pic">
                            <img src="${item.masterImg}" alt="">
                        </div>
                    </div>

                    <!--商品信息-->
                    <div class="right">
                        <!--标题-->
                        <div class="title">${item.title}</div>
                        <!--价格和数量-->
                        <div class="priceAndNum">
                            <!--金额-->
                            <p class="price">
                                ￥ <span>${item.price.toFixed(2)}</span>
                            </p>

                            <!--购买数量-->
                            <p class="num">x${item.num}</p>
                        </div>
                    </div>

                    <!--商品小计-->
                    <div class="bottom">
                        <div class="yunFei">
                            含运费： ￥<span>${item.freight && item.freight.toFixed(2)}</span>
                        </div>
                        <div class="xiaoJi">
                            小计： <span class="fontRed">￥ <i>${(item.subtotalPrice + item.freight).toFixed(2)}</i></span>
                        </div>
                    </div>
                </div>`;
                html += settlementItem;
            });
            $("#BScroll2 #scrollSettlement .settlementShopList").html(html);
        }
    }

    //显示隐藏购物车页面
    private isShowShopCart(isShow: boolean) {
        /*购物车页面*/
        $("#BScroll").css({
            display: isShow === true ? "block" : "none",
        });

        /*默认显示的头部*/
        $("#shoppingTrolley .drawer .showHeader").css({
            display: isShow === true ? "block" : "none",
        });

        /*默认显示的底部按钮*/
        $("#shoppingTrolley .drawer .showBottomBtn").css({
            display: isShow === true ? "block" : "none",
        });
    }

    /*给复选框绑定事件*/
    private InputBindingEvent() {
        //先取消事件
        $("#shoppingTrolley .drawer #BScroll input").off('change');

        //重新绑定事件
        let inputCheckAll = $("#shoppingTrolley .drawer #BScroll input");/*获取所有复选框*/
        for (let i = 0; i < inputCheckAll.length; i++) {
            let item = inputCheckAll[i];
            $(item).on("change", () => {
                /*是否选中*/
                let checkBox = $(item).is(":checked");
                /*获取当前商品*/
                let goodsItem: checkedShopItem = this.getCheckInputGoods(i);
                /*判断是否需要添加到selectGoods*/
                this.isPushGoods(checkBox, goodsItem);
                /*计算总金额*/
                this.computePrice(true);
            });
        }
    }

    /*给增加按钮和减少绑定点击事件*/
    private JiaBtnBindingEvent() {
        let _this = this;

        //先取消事件
        $(".shopList #BScroll .item .right .jia").off('click');
        $(".shopList #BScroll .item .right .jian").off('click');

        /*重新绑定事件*/

        let inputCheckAll = $("#shoppingTrolley .drawer #BScroll input");/*获取所有复选框*/
        let jiaBtn = $(".shopList #BScroll .item .right .jia");/*获取加号按钮*/
        let jianBtn = $(".shopList #BScroll .item .right .jian");/*获取减号按钮*/
        let numList = $(".shopList #BScroll .item .right .num");//获取数量元素
        let subtotalEleList = $("#scrollShopCart .item .title .price i");//每种商品的价格小计


        for (let i = 0; i < jiaBtn.length; i++) {
            $(jiaBtn[i]).off('click');
            $(jianBtn[i]).off('click');
            //增加数量
            $(jiaBtn[i]).on('click', function () {
                commonJiaAndJianEvent(i, true);
            });

            //减少数量
            $(jianBtn[i]).on('click', (e) => {
                commonJiaAndJianEvent(i, false);
            })
        }

        let time = 0;

        function commonJiaAndJianEvent(index: number, status: boolean) {
            //防抖
            if (new Date().getTime() - time > 100) {
                let num = Number($(numList[index]).text());//获取数量
                if (status) {
                    num++;//增加数量
                } else {
                    num--;//减少数量

                    if (num <= 1) {
                        num = 1;
                    }
                }

                $(numList[index]).text(num);//改变视图上的数量

                /*获取当前商品*/
                let goodsItem: checkedShopItem = _this.getCheckInputGoods(index);
                //获取当前的复选框是否选择
                let checkBox = $(inputCheckAll[index]).is(":checked");
                /*判断是否需要添加到selectGoods*/
                _this.isPushGoods(checkBox, goodsItem);
                /*计算总金额*/
                _this.computePrice(true);
                //改变视图上的小计价格
                $(subtotalEleList[index]).text((goodsItem.subtotalPrice).toFixed(2));

                /*请求修改数量*/
                // @ts-ignore
                window.page.PcUpdateNum(goodsItem);

                time = new Date().getTime();
            }
        }
    }

    /*计算总金额和总数量*/
    private computePrice(showShopCart: boolean) {
        //计算总金额
        let totalPrice: number = this.selectGoods.reduce((pre: any, next: any) => {
            //判断购物车页面是否显示
            if (showShopCart) {
                return pre + next.subtotalPrice;
            } else {
                //如果显示的是支付订单页那么要加上运费
                return pre + next.subtotalPrice + next.freight;
            }
        }, 0);
        $("#shoppingTrolley .drawer .bottomBtn .totalPrice").text('￥' + totalPrice.toFixed(2));

        //计算总数量
        let totalNum: number = this.selectGoods.reduce((pre: any, next: any) => {
            return pre + next.num;
        }, 0);
        $("#shoppingTrolley .drawer .bottomBtn .totalNum").text(totalNum);
        $(".layui-badge #badge").text(totalNum);
    }

    /*实例化订单滚动组价*/
    private initializeDingDanScroll() {
        this.dingDanScroll = new BScroll($("#BScroll2")[0], {
            click: true,//是否可以点击
            scrollY: true,//纵向滚动
        });
    }

    /*实例化购物车滚动组价*/
    private initializeShopCartScroll() {
        this.shopCartScroll = new BScroll($("#BScroll")[0], {
            click: true,//是否可以点击
            scrollY: true,//纵向滚动
        });
    }

    /*获取选中的商品*/
    private getCheckedGoods() {
        let inputCheck = $("#shoppingTrolley .drawer #BScroll input");
        let checkedGoods = [];
        for (let i = 0; i < inputCheck.length; i++) {
            let item = inputCheck[i];
            //判断是否选中了
            let checked = $(item).is(":checked");
            if (checked) {
                /*获取当前商品*/
                let goodsItem: checkedShopItem = this.getCheckInputGoods(i);
                checkedGoods.push(goodsItem);
            }
        }
        return checkedGoods;
    }

    /*获取当前复选框对应的商品*/
    private getCheckInputGoods(index: number) {
        //商品id  商品运费
        let goodsEleList = $("#scrollShopCart .item")[index];
        let id = $(goodsEleList).attr("data-id");
        let freight = $(goodsEleList).attr("data-freight") || 0;

        //商品标题
        let titleEleList = $("#scrollShopCart .item .title p.tit")[index];
        let title = $(titleEleList).text();

        //商品单价
        let priceEleList = $("#scrollShopCart .item .title .price")[index];
        let price = $(priceEleList).attr('data-price');

        //商品个数
        let numEleList = $("#scrollShopCart .item .right .num")[index];
        let num = $(numEleList).text();

        //商品主图
        let imgEleList = $("#scrollShopCart .midContent .pic img")[index];
        let masterImg = $(imgEleList).attr('src');

        let goodsInfo: checkedShopItem = {
            id: String(id),
            freight: Number(freight),
            title: String(title),
            price: Number(price),//单价
            num: Number(num),//选择个数
            masterImg: String(masterImg),//主图
            subtotalPrice: Number(price) * Number(num),//商品小计
        };

        return goodsInfo;
    }

    /*判断是否需要加入到 selectGoods*/
    private isPushGoods(isPush: boolean, goodsItem: checkedShopItem) {
        let index = this.selectGoods.findIndex(item => item.id === goodsItem.id);

        if (index !== -1) {
            /*如果数据已经存在了，先删除*/
            this.selectGoods.splice(index, 1);
        }

        //判断是否需要添加
        if (isPush) {
            /*如果是真就添加到 selectGoods*/
            this.selectGoods.push(goodsItem);
        }
    }

    /*加入购物车后将数据填充到购物车页面*/
    private appendShopDocument(productList: ShopCarProduct[]) {
        //先清空
        $("#scrollShopCart").html("");

        productList.forEach(item => {
            let goodsItem = `<div class="item" data-id="${item.id}" data-freight="${item.freight}">
                <!--多选按钮-->
                <div class="leftCheck">
                    <input type="checkbox">
                </div>
                <!--商品展示-->
                <div class="midContent">
                    <div class="pic">
                        <img src="${item.product_imgurl}"
                             alt="">
                    </div>
                    <!--标题、价格-->
                    <div class="title">
                        <p class="tit">${item.product_title}</p>
                        <p class="price" data-price="${item.product_price}">
                            ￥
                            <i>${item.xiaoJi}</i>
                        </p>
                    </div>
                </div>
                <!--增减商品数量-->
                <div class="right">
                    <span class="jia">+</span>
                    <span class="num">${item.product_num}</span>
                    <span class="jian">-</span>
                </div>
            </div>`;
            $("#scrollShopCart").append(goodsItem);
        });
    }
}
