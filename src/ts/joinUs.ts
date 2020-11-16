import "./util/remjs";
import "./util/headerEvent";
import "../scss/joinUs.scss";
import {controller} from "./decorator/index";

//加入我们
@controller
class JoinUs{
    constructor() {
        this.initialize();
    }
    //初始化
    private initialize(){
        this.index();
    }

    private index(){
        console.log('joinUs')
    }
}
