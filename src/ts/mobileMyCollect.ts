import "./util/remjs";
import "../scss/mobileMyCollect.scss";
import {controller} from "./decorator/index";
// import BScroll from "better-scroll";

//商品数据类型
interface GoodsDataType {
    id: string;//id
    title: string;//标题
    price: number;//价格
    subtotalPrice: number;//小计
    num: number;//数量
    masterImg: string;//主图
    freight: number;//运费
}


//我的购物车
@controller
class MobileMyCollect {
    // private preSelectNavX: any = $("#wrapper .content .nav-this")[0];//上次选择的X轴的导航
    // private myScroll: any;
    private selectGoodsList: GoodsDataType[] = [];//选中的商品

    constructor() {
        window.onload = () => {
            //初始化
            this.initialize();
        }
    }

    //初始化
    private initialize() {
        /*点击全选事件*/
        this.checkAllBtn();
        /*给复选框绑定事件*/
        this.InputBindingEvent();
        /*给增加按钮和减少绑定点击事件*/
        this.JiaBtnBindingEvent();
        /*删除按钮的点击事件*/
        this.deleteBtnClick();
        /*加入购物车按钮的点击事件*/
        this.joinShopCart();
    }

    /*全选点击事件*/
    private checkAllBtn() {
        let _this = this;
        $("#detailHeader .left-check #checkAll").on("change", function () {
            //当前全选按钮的状态
            let status = $(this).is(":checked");
            let checkInputList = $("#PageContent #scrollShopCart .leftCheck input");

            //将全部复选框选中
            checkInputList.prop('checked', status);

            /*获取所有商品*/
            if (status) {
                for (let i = 0; i < checkInputList.length; i++) {
                    /*获取选中的商品*/
                    let goodsInfo: GoodsDataType = _this.getCurrentGoodsInfo(i);
                    /*判断是否需要添加到selectGoods*/
                    _this.isPushGoods(status, goodsInfo);
                }
            } else {
                _this.selectGoodsList = [];
            }

            /*全选按钮是否设置选中状态*/
            _this.setCheckAllStatus();
            /*删除按钮是否高亮显示*/
            _this.deleteBgcShow();
            /*计算总金额*/
            _this.computePrice();
        });
    }

    /*给复选框绑定事件*/
    private InputBindingEvent() {
        let inputCheckAll = $("#PageContent #scrollShopCart .leftCheck input");/*获取所有复选框*/
        //先取消事件
        inputCheckAll.off('change');

        //重新绑定事件
        for (let i = 0; i < inputCheckAll.length; i++) {
            let item = inputCheckAll[i];
            $(item).on("change", () => {
                /*是否选中*/
                let checkBox = $(item).is(":checked");

                /*获取当前商品*/
                let goodsItem: GoodsDataType = this.getCurrentGoodsInfo(i);
                /*判断是否需要添加到selectGoods*/
                this.isPushGoods(checkBox, goodsItem);
                /*计算总金额*/
                this.computePrice();
                /*全选按钮是否设置选中状态*/
                this.setCheckAllStatus();
                /*删除按钮是否高亮显示*/
                this.deleteBgcShow();
            });
        }
    }

    /*给增加按钮和减少绑定点击事件*/
    private JiaBtnBindingEvent() {
        let _this = this;

        /*重新绑定事件*/

        let inputCheckAll = $("#PageContent #scrollShopCart .leftCheck input");/*获取所有复选框*/
        let jiaBtn = $("#scrollShopCart .item .right .jia");/*获取加号按钮*/
        let jianBtn = $("#scrollShopCart .item .right .jian");/*获取减号按钮*/
        let numList = $("#scrollShopCart .item .right .num");//获取数量元素
        let subtotalEleList = $("#scrollShopCart .item .title .price i");//每种商品的价格小计

        //先取消事件
        jiaBtn.off('click');
        jianBtn.off('click');


        for (let i = 0; i < jiaBtn.length; i++) {
            //增加数量
            $(jiaBtn[i]).on('click', function () {
                commonJiaAndJianEvent(i, true);
            });

            //减少数量
            $(jianBtn[i]).on('click', (e) => {
                commonJiaAndJianEvent(i, false);
            })
        }

        function commonJiaAndJianEvent(index: number, status: boolean) {
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

            /*获取当前商品信息*/
            let currentGoodsInfo: GoodsDataType = _this.getCurrentGoodsInfo(index);
            //获取当前的复选框是否选择
            let checkBox = $(inputCheckAll[index]).is(":checked");
            /*判断是否需要添加到selectGoods*/
            _this.isPushGoods(checkBox, currentGoodsInfo);
            /*计算总金额*/
            _this.computePrice();
            //改变视图上的小计价格
            $(subtotalEleList[index]).text((currentGoodsInfo.subtotalPrice).toFixed(2));

            /*请求修改数量*/
            // @ts-ignore
            // window.page.MobileUpdateNum(currentGoodsInfo);
        }
    }

    /*删除按钮的点击事件*/
    private deleteBtnClick() {
        let _this = this;
        $("#footer .deleteGoods").on("click", function () {
            let inputCheckAll = $("#PageContent #scrollShopCart .leftCheck input");//所有商品的复选框
            let shopList = $("#PageContent #scrollShopCart .item");//所有商品元素

            //等待删除的元素
            let awaitDelete = [];
            //删除掉的商品
            let delShopCart = [];

            for (let i = 0; i < inputCheckAll.length; i++) {
                //当前复选框是否选则了
                let check = $(inputCheckAll[i]).is(":checked");
                //当前复选框对应的元素
                let shopItem = shopList[i];
                //判断当前复选框是否选则了
                if (check) {
                    /*获取当前复选框对应的数据*/
                    let goodsItem = _this.getCurrentGoodsInfo(i);
                    delShopCart.push(goodsItem);
                    //先删除对应的数据
                    _this.isPushGoods(false, goodsItem);
                    //收集待删除的元素
                    awaitDelete.push(shopItem);
                }

                /*后删除选中的元素*/
                if (i === inputCheckAll.length - 1) {
                    awaitDelete.forEach(item => {
                        $("#PageContent #scrollShopCart").find(item).remove();
                    });
                }
            }

            //请求删除
            // @ts-ignore
            delShopCart.length && window.page.MobileDeleteGoods.call(this, delShopCart);

            /*重新给复选框绑定事件*/
            _this.InputBindingEvent();
            /*重新给增加按钮和减少绑定点击事件*/
            _this.JiaBtnBindingEvent();
            /*重新计算总金额和数量*/
            _this.computePrice();

            /*全选按钮是否设置选中状态*/
            _this.setCheckAllStatus();
            /*删除按钮是否高亮显示*/
            _this.deleteBgcShow();
        })
    }

    /*加入购物车按钮的点击事件*/
    private joinShopCart(){
        let _this = this;
        $("#footer .joinShopCart").on('click', function () {
            //加入购物车
            // @ts-ignore
            _this.selectGoodsList.length && window.page.joinShopCart.call(this, _this.selectGoodsList);
        })
    }

    /*获取当前对应的商品*/
    private getCurrentGoodsInfo(index: number) {
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

        let goodsInfo: GoodsDataType = {
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
    private isPushGoods(isPush: boolean, goodsItem: GoodsDataType) {
        let index = this.selectGoodsList.findIndex(item => item.id === goodsItem.id);

        if (index !== -1) {
            /*如果数据已经存在了，先删除*/
            this.selectGoodsList.splice(index, 1);
        }

        //判断是否需要添加
        if (isPush) {
            /*如果是真就添加到 selectGoods*/
            this.selectGoodsList.push(goodsItem);
        }
    }

    /*计算总金额和总数量*/
    private computePrice() {
        //计算总金额
        let totalPrice: number = this.selectGoodsList.reduce((pre: any, next: any) => {
            return pre + next.subtotalPrice + next.freight;
        }, 0);
        $("#footer .total-price span").text(totalPrice.toFixed(2));

        //计算总数量
        let totalNum: number = this.selectGoodsList.reduce((pre: any, next: any) => {
            return pre + next.num;
        }, 0);
        $("#footer .total-check-num span").text(totalNum);
    }

    /*全选按钮是否需要设置选中状态*/
    private setCheckAllStatus() {
        let checkAll = $("#detailHeader .left-check #checkAll");//全选按钮
        let inputCheckAll = $("#PageContent #scrollShopCart .leftCheck input");/*获取所有复选框*/

        let statusArr = [];
        for (let i = 0; i < inputCheckAll.length; i++) {
            let input = inputCheckAll[i];
            statusArr.push($(input).is(":checked"))
        }

        //判断是否包含false
        let status = statusArr.includes(false);
        // 如果包含false则全选按钮设置不选中状态
        checkAll.prop("checked", !status && inputCheckAll.length);
    }

    /*删除按钮是否高亮显示*/
    private deleteBgcShow() {
        let deleteGoods = $("#footer .deleteGoods");//删除按钮
        let inputCheckAll = $("#PageContent #scrollShopCart .leftCheck input");/*获取所有复选框*/

        let statusArr = [];
        for (let i = 0; i < inputCheckAll.length; i++) {
            let input = inputCheckAll[i];
            statusArr.push($(input).is(":checked"))
        }

        //判断是否包含true
        let status = statusArr.includes(true);
        /*如果包含true则高亮显示删除按钮*/
        deleteGoods.css({
            backgroundColor: status ? "red" : "gray",
        })
    }
}
