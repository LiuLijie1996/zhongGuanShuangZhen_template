import "./util/remjs";
import "./util/headerEvent";
import "../scss/joinLeague.scss";
import {controller} from "./decorator/index";

//合作加盟
@controller
class JoinLeague{
    constructor() {
        this.initialize();
    }
    //初始化
    private initialize(){
        this.index();
    }

    private index(){
        console.log('joinLeague')
    }
}
