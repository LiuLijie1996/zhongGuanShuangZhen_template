import "./util/remjs";
import "./util/headerEvent";
import "../scss/index.scss";
import {controller} from "./decorator/index";

//首页
@controller
class Index{
    constructor() {
        //初始化
        this.initialize();
    }

    //初始化
    private initialize() {}
}
