<template>
    <div>
        <el-card>
            <el-steps :active="activeIndex - 0" finish-status="success"  align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
            </el-steps>
              <el-form :model="eidtgoodInfo" ref="eidtgoodInfoRef" :rules="eidtgoodInfoRules" label-position="top" >
                <el-tabs v-model="activeIndex"  tab-position="left" :before-leave="beforeLeave" @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <!-- 基本信息 -->                  
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="eidtgoodInfo.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="eidtgoodInfo.goods_price" type="number"></el-input>
                        </el-form-item>
                         <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="eidtgoodInfo.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="eidtgoodInfo.goods_number" type="number"></el-input>
                        </el-form-item> 
                         <el-form-item label="商品分类" prop="goods_cat">
                           <el-cascader v-model="eidtgoodInfo.goods_cat" :options="Categories" :props="props" clearable @change="handleChange"></el-cascader>
                        </el-form-item>                  
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                      <el-form-item  v-for="item in attr_name" :key="item.attr_id"  :label="item.attr_name">                                  
                            <el-checkbox-group v-model="manyTableData">
                                <el-checkbox v-for="(vals,ind) in item.attr_vals" :key="ind" :label="vals" border @change="goodsChange"></el-checkbox>
                            </el-checkbox-group> 
                       </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <!-- 商品静态属性面板 -->     
                        <el-form-item v-for="item in onlyTableData" :key="item.attr_id"  :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- 图片上传 -->
                        <el-upload class="upload-demo" :action="uploadURL" :on-preview="handlePreview"
                        :on-remove="handleRemove" :file-list="fileList"  list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>

                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑组件 -->
                           <quill-editor v-model="eidtgoodInfo.goods_introduce"  
                                         ref="myQuillEditor"  
                                         :options="editorOption"  
                                         @blur="onEditorBlur($event)"  
                                         @focus="onEditorFocus($event)"
                                         @ready="onEditorReady($event)"> 
                           </quill-editor>
                           <!-- 添加商品按钮 -->
                           <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>  
        </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return{
            id: this.$route.params.id, //获取地址id 参数
            editorOption:{},
            activeIndex:'0', 
            //  addgoodInfo:{
            //     goods_name:'',
            //     goods_price:0,
            //     goods_weight:0,
            //     goods_number:0,
            //     goods_cat:[], //商品分类选中数据               
            //     pics:[],
            //     attrs:[],
            //     goods_introduce: '' 
            // },            
            eidtgoodInfo:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:[], //商品分类选中数据               
                pics:[],
                attrs:[],
                goods_introduce: '' 
            },
            eidtgoodInfoRules:{ 
                goods_name:[
                    {required:true,message:'请输入商品名称',trigger:'blur'}
                ],
                goods_price:[
                    {required:true,message:'请输入商品价格',trigger:'blur'}
                ],
                 goods_weight:[
                    {required:true,message:'请输入商品重量',trigger:'blur'}
                ],
                goods_number:[
                    {required:true,message:'请输入商品数量',trigger:'blur'}
                ],
            },
            Categories:[],
            props:{  //商品分类级联选择器配置项
                value: 'cat_id',
                label:'cat_name',
                children:'children'
            },
            attr_name:[],
            manyTableData:[],
            onlyTableData:[],
            fileList:[],
            uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
            headerObj:{Authorization:window.sessionStorage.getItem('token')},
            bigPicVisible:false,
            bigPicUrl:''
        }
    },
    created(){ 
        //获取商品基础数据 
        this.getGoodData()            
        //获取分类数据
        this.getGoodsCategories()    
      
    },
    updated(){
       
    },
    methods:{
        //获取商品分类
        async getGoodsCategories(){
            const {data:res} = await this.$http.get('categories')
            if(res.meta.status != 200){
                this.$message.error(res.meta.msg)
            }
           
            this.Categories = res.data            
        },
        //商品分类级联选择器change触发事件 
        handleChange(){
            if(this.eidtgoodInfo.goods_cat.length !==3){
                this.categoriesValue = [];
            }
        },
         //Tab切换的钩子函数
        beforeLeave(activeName,oldActiveName){
            if(oldActiveName == '0' && this.eidtgoodInfo.goods_cat.length !==3){
                this.$message.error('需选择商品分类');
                 return false;
            }           
        },
         //选择商品参数时触发change事件 
        goodsChange(){
            console.log('manyTableData',this.manyTableData);
        },
        //上传图片是预览事件
        handlePreview(file){
           // console.log(file)
                      
           this.bigPicUrl = file.response.data.url
           this.bigPicVisible = true
        },
        //删除文件的钩子
        handleRemove(file){ 
           
            //获取将要删除图片的临时路径
            const filePath = file.response.data.tmp_path;
            //从pics数组中，找到这个图片路径的索引值
            const ind = this.eidtgoodInfo.pics.findIndex(item=>{
                item.pics == filePath;
            })
            //调用数组的splice方法，将图片信息对象 从数组中删除
            this.eidtgoodInfo.pics.splice(ind,1);
            console.log(this.eidtgoodInfo.pics);
        },
        //文件上传成功时的钩子
        handleSuccess(response){
            if(response.meta.status == 200){
                 this.eidtgoodInfo.pics.push({pics:response.data.tmp_path});
            } 
                  
        },
        async getGoodData(){
            //根据id获取单个商品数据
           const {data:res} = await this.$http.get(`goods/${this.id}`)
           if(res.meta.status != 200){
               return this.$message.error(res.meta.msg)
           }
           //处理商品分类数据，字符串转化为数组
           res.data.goods_cat = res.data.goods_cat.split(',').map(Number)  
            //处理上传图片路径数据，截取图片路径，获取图片名称          
           
           res.data.pics.forEach(item=>{
                this.fileList.push(JSON.parse(JSON.stringify(item).replace(/pics_sma_url/g,'url')))  
                          
           })
           console.log('data', res.data)   
           this.eidtgoodInfo.goods_name = res.data.goods_name
           this.eidtgoodInfo.goods_price = res.data.goods_price
           this.eidtgoodInfo.goods_weight = res.data.goods_weight
           this.eidtgoodInfo.goods_number = res.data.goods_number
           this.eidtgoodInfo.goods_cat = res.data.goods_cat
           this.eidtgoodInfo.pics = res.data.pics
           this.eidtgoodInfo.attrs = res.data.attrs
           this.eidtgoodInfo.goods_introduce = res.data.goods_introduce
         //  let {goods_name,goods_price,goods_weight,goods_number,goods_cat,pics,attrs,goods_introduce} = res.data           
            // goods_name:'',
            //     goods_price:0,
            //     goods_weight:0,
            //     goods_number:0,
            //     goods_cat:[], //商品分类选中数据               
            //     pics:[],
            //     attrs:[],
            //     goods_introduce: '' 
          // this.eidtgoodInfo = res.data     
    
           console.log('eidtgoodInfo',this.eidtgoodInfo)                            
        },
         //商品参数被选中时触发
        async tabClick(){
           //如果当前访问的是商品参数面板
           if(this.activeIndex == 1){
               console.log(this.eidtgoodInfo.goods_cat[2])
               const {data:res} = await this.$http.get(`categories/${this.eidtgoodInfo.goods_cat[2]}/attributes`,{params:{sel:'many'}});
               if(res.meta.status != 200){
                 return this.$message.error(res.meta.msg);
                }                
                res.data.forEach(item=>{
                    console.log('attr_val',item.attr_vals);
                    item.attr_vals = item.attr_vals?item.attr_vals.split(','):[];
                })
                this.attr_name = res.data;
                console.log('attr_name',this.attr_name)
            }
            //如果当前访问的是商品属性面板
            if (this.activeIndex == 2){
                const {data:res} = await this.$http.get(`categories/${this.eidtgoodInfo.goods_cat[2]}/attributes`,{params:{sel:'only'}});
                if(res.meta.status != 200){
                 return this.$message.error(res.meta.msg);
                }    
                this.onlyTableData = res.data;
            }
        },
         onEditorBlur(editor) {
            console.log('editor blur!', editor)
        },
        onEditorFocus(editor) {
            console.log('editor focus!', editor)
        },
        onEditorReady(editor) {
            console.log('editor ready!', editor)
        },
         //添加商品
        add(){
            this.$refs.eidtgoodInfoRef.validate(async valid=>{
                if(!valid){
                    return this.$message.error('请填写必填的表单项！')
                }
                //处理动态参数
                this.attr_name.forEach(item=>{
                    item.attr_vals.forEach(val=>{
                      if(this.manyTableData.includes(val)){
                          const obj = {attr_id:'',attr_value:''}
                          obj.attr_id = item.attr_id
                          obj.attr_value = val
                          this.eidtgoodInfo.attrs.push(obj);                        
                      }
                    })
                })
                //处理静态参数
                this.onlyTableData.forEach(item=>{
                    const obj = {attr_id:'',attr_value:''}
                     obj.attr_id = item.attr_id
                     obj.attr_value = item.attr_vals
                     this.eidtgoodInfo.attrs.push(obj);     
                })
                //数据深拷贝
                let _form = JSON.parse(JSON.stringify(this.eidtgoodInfo))
                _form.goods_cat = _form.goods_cat.join(',')           
               //执行编辑的业务逻辑
                console.log('_form',_form)
                const {data:res} = await this.$http.put(`goods/${this.id}`,_form)
                if(res.meta.status != 200){
                
                    return this.$message.error(res.meta.msg)
                }
                this.$message.success('添加商品成功！')
                this.$router.push('/goods')
            })
        }
    }
}
</script>
<style lang="less" scoped>
    .el-steps{margin: 20px 0 30px;}
    .el-checkbox{margin: 0 15px 15px 0 !important;}
    .btnAdd{margin-top: 20px;}
    .previewImg{width:100%;}
</style>

