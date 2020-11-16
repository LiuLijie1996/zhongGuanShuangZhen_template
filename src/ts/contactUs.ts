import "./util/remjs";
import "./util/headerEvent";
import "../scss/contactUs.scss";
import {controller} from "./decorator/index";

//联系我们
@controller
class ContactUs{
    constructor() {
        this.initialize();
    }
    //初始化
    private initialize(){
        this.index();
    }

    private index(){
        console.log('contactUs')
    }
}
