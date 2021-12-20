<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>

            <!-- alert警告 -->
            <el-alert title="添加商品信息" type="info" show-icon center closable></el-alert>
            <!-- steps步骤条 -->
            <el-steps :space="250" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addgoodInfo" ref="addgoodInfoRef" :rules="addgoodInfoRules" label-position="top" >
                <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeLeave" @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <!-- 基本信息 -->                  
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addgoodInfo.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addgoodInfo.goods_price" type="number"></el-input>
                        </el-form-item>
                         <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addgoodInfo.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addgoodInfo.goods_number" type="number"></el-input>
                        </el-form-item> 
                         <el-form-item label="商品分类" prop="goods_cat">
                           <el-cascader v-model="addgoodInfo.goods_cat" :options="Categories" :props="props" clearable @change="handleChange"></el-cascader>
                        </el-form-item>                  
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                      <el-form-item  v-for="item in attr_name" :key="item.attr_id"  :label="item.attr_name">
                           <!-- <el-radio-group v-model="manyTableData">
                                <el-radio  v-for="(attr_vals,ind) in item.attr_vals" :key="ind" :label="attr_vals" @change="goodsChange">{{attr_vals}}</el-radio>
                           </el-radio-group> -->
                                        
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
                           <quill-editor v-model="addgoodInfo.goods_introduce"  
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
        <!-- 放大图片对话框 -->
        <el-dialog title="分配角色"  :visible.sync="bigPicVisible"  width="30%" @close="setPicClosed">
           <img :src="bigPicUrl" alt="" class="previewImg">
        </el-dialog>

    </div>
</template>
<script>

export default {
    data() {
        return {
            editorOption:{},
            activeIndex:'0',
            addgoodInfo:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:[], //商品分类选中数据               
                pics:[],
                attrs:[],
                goods_introduce: '' 
            }, 
            attr_name:[],
            fileList:[],
            manyTableData:[],
            onlyTableData:[],
            headerObj:{Authorization:window.sessionStorage.getItem('token')},
            addgoodInfoRules:{
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
            uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
            bigPicVisible:false,
            bigPicUrl:''
           
        }
    },
    created(){
        this.getGoodsCategories();
    },
    methods:{
        //获取商品分类
        async getGoodsCategories(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status != 200){
                this.$message.error(res.meta.msg);
            }
            this.Categories = res.data;
        },
        //商品分类级联选择器change触发事件 
        handleChange(){
            if(this.addgoodInfo.goods_cat.length !==3){
                this.categoriesValue = [];
            }
        },
        //Tab切换的钩子函数
        beforeLeave(activeName,oldActiveName){
            if(oldActiveName == '0' && this.addgoodInfo.goods_cat.length !==3){
                this.$message.error('需选择商品分类');
                 return false;
            }           
        },
        //商品参数被选中时触发
        async tabClick(){
           //如果当前访问的是商品参数面板
           if(this.activeIndex == 1){
               const {data:res} = await this.$http.get(`categories/${this.addgoodInfo.goods_cat[2]}/attributes`,{params:{sel:'many'}});
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
                const {data:res} = await this.$http.get(`categories/${this.addgoodInfo.goods_cat[2]}/attributes`,{params:{sel:'only'}});
                if(res.meta.status != 200){
                 return this.$message.error(res.meta.msg);
                }    
                this.onlyTableData = res.data;
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
            const ind = this.addgoodInfo.pics.findIndex(item=>{
                item.pics == filePath;
            })
            //调用数组的splice方法，将图片信息对象 从数组中删除
            this.addgoodInfo.pics.splice(ind,1);
            console.log(this.addgoodInfo.pics);
        },
        //文件上传成功时的钩子
        handleSuccess(response){
            if(response.meta.status == 200){
                 this.addgoodInfo.pics.push({pics:response.data.tmp_path});
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
            this.$refs.addgoodInfoRef.validate(async valid=>{
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
                          this.addgoodInfo.attrs.push(obj);                        
                      }
                    })
                })
                //处理静态参数
                this.onlyTableData.forEach(item=>{
                    const obj = {attr_id:'',attr_value:''}
                     obj.attr_id = item.attr_id
                     obj.attr_value = item.attr_vals
                     this.addgoodInfo.attrs.push(obj);     
                })
                //数据深拷贝
                let _form = JSON.parse(JSON.stringify(this.addgoodInfo))
                _form.goods_cat = _form.goods_cat.join(',')           
               //执行添加的业务逻辑
                const {data:res} = await this.$http.post('goods',_form)
                if(res.meta.status != 201){
                    return this.$message.error(res.meta.msg)
                }
                this.$message.success('添加商品成功！')
                this.$router.push('/goods')
            })
        },
        setPicClosed(){

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
