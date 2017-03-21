/**
 * 一行3个方图货架
 *
 */

/**
 * 一行3个方图货架222222
 *
 */

//inline 

define(function (require, exports){
    var Class = require("library/class");
    var template = require("library/template");
    var htmlStr = require("templates/specialActivity/proShelf");
    var ModuleWapper = require("./moduleWapper");
    var uploadImgDialog = require("./uploadImgDialog");
    var shelfGoodsModule = require("./chooseGoodsModuleWrap");
    var event = require("library/event");
    var ImgModel = require("./imgModel");

    var ProShelf = new Class({
        Extends: ModuleWapper,
        options : {
            data:{
                content: {
                    AutoSort: "1",
                    Image: "",
//                    ProdctType: {},
                    Products:"",
                    ProductImgType:0,
                    Sort: "SYSTEMDEFAULT"
                },
                hideWhenPreheatting: "0",
                modelId: "",
                modelName: "",
                pageId: "",
                position: "",
                sort: "0"
            },
            initData : {
                createIsVirtual:true
            }
        },
        initialize: function (data){
            this.parent(data);
            this.options = Object.merge({}, this.options, data);
            var tmpData = this.dataTreat($.extend({},this.options.data),this.options.initData);
            this.subElement = $(template.compile(htmlStr)({data:tmpData,initData:this.options.initData}));
            this.comp = {
                addImgBtn : this.subElement.find(".addImg"),
                cleanTextarea : this.subElement.find("textarea"),
                sort : this.subElement.find("select[name='Sort']"),
                ProductType:this.subElement.find("input[name=ProductType]"),
                ProductTyped:this.subElement.find("input[name=ProductType]:checked"),
                fastChooseGoods:this.subElement.find(".fastChooseGoods"),
                sortChooseGoods:this.subElement.find(".sortChooseGoods"),
                xuanpinWrap:this.subElement.find(".xuanpinWrap"),
                textareaWrapDiv:this.subElement.find("textarea").closest(".form-group"),
                imgBtnWrap:this.subElement.find(".img-btn-wrap"),
                listBtnWrap:this.subElement.find(".list-btn-wrap"),
            };
            this.setContent(this.subElement);
            this.comp.cleanTextarea.html(this.comp.cleanTextarea.html().trim());

            if(!this.options.initData.createIsVirtual && this.options.data.modelId == 16)
                $('<span>(<font color="red">此竖图货架模块仅聚美运营可操作</font>)</span>').insertBefore(this.element.find(".module_header span.w"));
            this._doThing();
        },
        _doThing : function (){
            var self = this;
            this.comp.addImgBtn.click(function(e){
                var $this=$(e.target);
                var w = this.options.data.moduleWidth,
                 src = '/Image/ImageManager?width='+w+'&height=2000&width_check_type=eq&height_check_type=leq&module_key=proShelf';
           //         src = '/Image/BatchImageManager?width='+w+'&height=2000&width_check_type=eq&height_check_type=leq&module_key=batchUploadImage';
                var $controls = $this.closest(".controls");
                var input_hide = $controls.find("input[type=hidden]");
                var imgName = $controls.find(".imgName");
                var img = $controls.find("img");
                var help = $controls.find(".help-block");
                uploadImgDialog.show({url:src,type:"module",inputHide:input_hide,imgName:imgName,img:img,help:help,maxWidth:w,maxHeight:0});
            }.bind(this));
            this.comp.sort.change(function() {
                if(self.comp.sort.val() == 'SYSTEMDEFAULT'){
                self.comp.sort.parent('div').next('span').show();
                }else{
                    self.comp.sort.parent('div').next('span').hide();
                }
            }.bind(this));
            var this_product = {};
            var checkedVal = this.comp.ProductTyped.val();
            this.comp.ProductType.change(function(e){
                var this_val = $(e.target).val();
                if(checkedVal){
                    this_product[checkedVal] = this.comp.cleanTextarea.val();
                }
                this.comp.cleanTextarea.val(this_product[this_val]);
                checkedVal = this_val;
            }.bind(this));

            //选品功能，每次点击就重新初始化选品module，关闭时销毁。
            this.comp.xuanpinWrap.on("click",".xuanpin",function(){

                var products= self.getFormData().Content;
                var goodsArr =self.treatChooseDoods(products);

                var productsAll = event.getApiFunResult(event.API_GET_PAGECONTENT_FORM);
                var allGoodsArr = self.treatChooseDoods(productsAll);

                var goodsArrNum = goodsArr.length;
                var btnnum = $(this).attr("data-btn");
                if( goodsArrNum == 0){
                    if(btnnum == 1){ //点击的“已选商品排序”
                        alert("请先选品!");
                        return;
                    }
                }else{ //点击的"快速选品"
                    var limitNum = self._maxChooseGoodsNum();
                    if(goodsArrNum > limitNum){
                        var num = goodsArrNum - limitNum;
                        alert("该货架最多填写"+limitNum+"个,已超出限制"+num+"个");
                        return;
                    }
                }
                var shelfModule = new shelfGoodsModule({
                    onSave : function(proHashIds){
                        self.comp.cleanTextarea.val(proHashIds.join("\n"));
                        if(self.shelfModelType == "img"){
                            if(proHashIds.length != 0){
                                self.setShelfModel();
                            }else{
                                self.ImgModelInstance.clearItem();
                            }
                        }
                    },
                    data:{},  //后端返回的选品数据。
                    feData:{
                        goodsArr:goodsArr,  //用户填写的hashid、productid、mallid。
                        allGoodsArr:allGoodsArr,  //所有模块的hashid、productid、mallid。
                        btn:btnnum,    //0代表“选品”，1代表“已选商品排序”。
                        modelId:self.options.data.modelId   //模块的id。
                    }
                });
            });

            this.comp.xuanpinWrap.on("click",".shift-model",function(){
                var model = $(this).find("a").attr("data-btn");  // "list":列表模式。“img”：图片模式
                var $$this = $(this);
                if(model == "img"){
                    var assign = self.comp.textareaWrapDiv;
                    self.ImgModelInstance = new ImgModel(assign,{
                            data: self.getData(),
                            initData:{column:3,},
                            onGetedData:function(){
                                self.comp.cleanTextarea.hide();
                                $$this.hide().siblings(".shift-model").show();
                                self.shelfModelType = "img";
                            },
                            onDeal:function(proHashIds){
                               self.comp.cleanTextarea.val(proHashIds.join("\n"));
                            }
                    });
                }else{   //model == "list" , 点击的是列表模式。
                    var proHashIds = self.ImgModelInstance.getData();
                    self.comp.cleanTextarea.val(proHashIds.join("\n")).show();
                    $$this.hide().siblings(".shift-model").show();
                    self.shelfModelType = "list";
                    self.ImgModelInstance.destroy();
                }
            });
        },
        /**
         * [setShelfModel description]设置货架的展示类型
         * @param {[type]} model [description]model="img":图片模式，model="list":列表模式
         */
        setShelfModel:function(model){
            var self = this;
            var assign = self.comp.textareaWrapDiv;
            if(self.ImgModelInstance){
                self.ImgModelInstance.destroy();
            };
            self.ImgModelInstance = new ImgModel(assign,{
                    data: self.getData(),
                    initData:{column:3,},
                    onGetedData:function(){
                        self.comp.cleanTextarea.hide();
                        self.comp.imgBtnWrap.hide();
                        self.comp.listBtnWrap.show();
                        self.shelfModelType = "img";
                    },
                    onDeal:function(proHashIds){
                       self.comp.cleanTextarea.val(proHashIds.join("\n"));
                    }
            });
        },

        /**
         * @descript:根据模块id设置能选择的商品总数。
         * @param:modelid:模块id
         * @remarks:pc一行四个货架200个，其他货架100个
         */
        _maxChooseGoodsNum:function(){
            var maxNum;
            var modelid = this.options.data.modelId;
            modelid == 16 ?  maxNum=200 : maxNum=100;
            return maxNum;
        },
        /*
         * @descript:处理填入的商品数据，过滤重复的值，过滤空格，返回一个数组。
         */
        treatChooseDoods:function(arr){
            var goods = arr.replace(/[\r|\n|\r\n|\n\r]/g,",");
            var goodsArray = goods.split(",");
            var goodsData = [];
            var goodsObj ={};
            goodsArray.each(function(value){
                if(value && !goodsObj[value]){
                    goodsObj[value] = 1;
                    goodsData.push(value);
                }
            });
            return goodsData;

        },
        setPlatform : function(device){
            if (device == "pc"){
                this.element.find(".web_app").hide();
                this.element.find(".web_set").show();
            } else if(device == "app") {
                this.element.find(".web_app").show();
                this.element.find(".web_set").hide();
            }
        },
        dataTreat : function (data){
            var _data = data;

            // 字符串替换处理
            if (_data.content&&_data.content.Products){
                _data.content.Products = _data.content.Products.replace(/,/g, "\n");
            }
            return _data;
        },
        getData : function(){
            var formData = this.getFormData();
            var data = this.processDataByOptions(formData);
            var shelf = formData.Content.trim().replace(/[\r|\n|\r\n|\n\r]/g,",");
            var shelfArray = shelf.split(",");
            var shelfArray2 = [];
            shelfArray.each(function(a){
                if(a){
                    shelfArray2.push(a);
                }
            });
            data.content.Products = shelfArray2.join(",");

            return data;
        },
        hide : function (){
            this.element.hide();
        },
        destroy : function (){
            this.element.remove();
        }

    });

    return ProShelf;
});
