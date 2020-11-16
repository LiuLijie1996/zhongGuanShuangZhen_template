import "./util/remjs";
import "../scss/buyItNow.scss";
import {controller} from "./decorator/index";

//商品数据类型
interface GoodsDataType {
    id: string;//商品id
    title: string;//标题
    price: number;//价格
    subtotalPrice: number;//小计
    num: number;//数量
    masterImg: string;//主图
    freight: number;//运费
}

//联系我们
@controller
class BuyItNow {
    private GoodsList: GoodsDataType[] = [];

    constructor() {
        window.onload = () => {
            this.initialize();
        }
    }

    //初始化
    private initialize() {
        /*点击修改地址的事件*/
        this.updateLocationBtn();
        /*点击确认付款的事件*/
        this.affirmPayment();
        /*获取所有商品*/
        this.getGoodsList();
    }

    /*点击修改地址的事件*/
    private updateLocationBtn() {
        /*点击修改地址*/
        let time = 0;
        $(".updateLocationBtn").on('click', () => {
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
                        window.page.MobileUpdateLocationSubmit.call(this, data.field);
                        return false;
                    });
                });

                time = new Date().getTime();
            }
        });
    }

    /*点击确认付款*/
    private affirmPayment(){
        let _this = this;
        $(".affirmPayment").on("click", function () {
            // @ts-ignore
            window.page.MobileAffirmPayment(_this.GoodsList);
        })
    }

    /*获取所有商品*/
    private getGoodsList() {
        let settlementItem = $(".settlementShopList .settlementItem");//商品id
        let titleList = $(".settlementShopList .settlementItem .title");//商品标题
        let imgList = $(".settlementShopList .settlementItem img");//商品主图
        let priceList = $(".settlementShopList .settlementItem .price span");//商品价格
        let goodsNumList = $(".settlementShopList .settlementItem .num span");//商品数量
        let subtotalPriceList = $(".settlementShopList .settlementItem .xiaoJi span i");//商品小计

        for (let i = 0; i < titleList.length; i++) {
            let goodsInfo: GoodsDataType = {
                id: String($(settlementItem[i]).attr("data-id")),
                title: String($(titleList[i]).text()),
                price: Number($(priceList[i]).text()),
                subtotalPrice: Number($(subtotalPriceList[i]).text()),
                num: Number($(goodsNumList[i]).text()),
                masterImg: String($(imgList[i]).attr("src")),
                freight: Number($(settlementItem[i]).attr("data-freight")),
            };

            this.GoodsList.push(goodsInfo);
        }
    }
}
