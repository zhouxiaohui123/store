<template>
    <div>
         <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span ="6">
                    <!-- 搜索框 -->
                     <el-input v-model="queryInfo.query" placeholder="输入内容" @keyup.enter.native="getOrderData" clearable @clear="getOrderData">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderData"></el-button>
                    </el-input>
                </el-col>
                <el-col :span ="6">
                    <!-- <router-link to="/"></router-link> -->
                    <el-button type="primary">添加商品</el-button>
                </el-col>
            </el-row>
            <el-table :data="orderData" border stripe style="width: 100%">
                <el-table-column type='index'></el-table-column>
                <el-table-column label='订单编号' prop="order_number"></el-table-column>
                <el-table-column label='订单价格' prop="order_price"></el-table-column>
                <el-table-column label='是否付款' prop="pay_status">
                    <template v-slot="scope">
                        <el-tag type="success" v-if="scope.row.pay_status == 1">已付款</el-tag>
                        <el-tag type="danger" v-else-if="scope.row.pay_status == 0">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label='是否发货' prop="is_send"></el-table-column>
                <el-table-column label='下单时间' prop="update_time">
                    <template v-slot="scope">
                        {{scope.row.update_time | dataFormat}}
                    </template> 
                </el-table-column>
                <el-table-column label='操作'>
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox(scope.row.order_id)"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showKuaidiBox(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="block">
                 <!-- page-size 每页显示条目个数  -->
                <el-pagination  @size-change="handleSizeChange"  @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1,2, 5, 10, 20]"
                :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
            </div>  
             <!--修改地址对话框-->
             <el-dialog title="修改地址" :visible.sync="editAdressVisible" @close="editAdressClose" width="30%">
                 <el-form :model="editForm"  ref="editFormRef" :rules="editFormRules" label-width="100px">
                     <el-form-item label="省市区/县" prop="city">
                        <el-cascader v-model="editForm.city" :options="citydata" @change="handleChange"> </el-cascader>
                        <!-- <el-input v-model="editForm.city"></el-input> -->
                     </el-form-item>
                     <el-form-item label="详细地址" prop="address">
                         <el-input v-model="editForm.address"></el-input>
                     </el-form-item>
                 </el-form>
                  <span slot="footer" class="dialog-footer">
                     <el-button @click="editDialogVisible = false">取 消</el-button>
                     <el-button type="primary" @click="editAdressOk">确 定</el-button>
                  </span>
             </el-dialog>
             <!-- 物流信息对话框 -->
             <el-dialog title="物流进度" :visible.sync="checkkuaidiInfo" @close="checkkuaidiClose" width="30%">
                 <el-timeline>
                    <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.time">
                    {{activity.context}}
                    </el-timeline-item>
                </el-timeline>
             </el-dialog>
        </el-card>
    </div>
</template>
<script>
import citydata from '../../assets/js/citydata.js'
import kuaidi from './kuaidi.json'
export default {
    data(){
        return {
            queryInfo:{ 
                query:'',
                pagenum: 1,
                pagesize: 5
            },
            orderData:[],
            total:0,
            editAdressVisible:false,
            editFormRules:{
                city:[
                    {required:true,message:'请选择省市区/县',trigger:'blur'}
                ],
                address:[
                    {required:true,message:'请输入详细地址',trigger:'blur'}
                ]

            },
            editForm:{
                city:'',
                address:''
            },
            citydata: citydata,  //省市区/县 级联选择器数据 
            checkkuaidiInfo:false, //物流信息对话框
            activities:kuaidi //物流进度
        }
    },
    created(){
        this.getOrderData()
    },
    methods:{
        //获取订单数据
        async getOrderData(){
             console.log('queryInfo',this.queryInfo)
            const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
            if(res.meta.status != 200){
                return this.$message.error(res.meta.msg);
            }
            this.orderData = res.data.goods
            this.total = res.data.total
            console.log('order',this.orderData)
        },
        //页码大小触发事件 
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getOrderData();
        },
        //当前页变动触发事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
             this.getOrderData();
        },
        showBox(){

        },
        deleteGoods(){

        },
        //修改地址对话框
        showBox(id){
            this.editAdressVisible = true
        },
        //修改地址对话框关闭事件
        editAdressClose(){
           this.$refs.editFormRef.resetFields()
        },
        //级联选择器触发事件 
        handleChange(){

        },
        editAdressOk(){

        },
        //快递物流对话框
        async showKuaidiBox(){
            this.checkkuaidiInfo = true
            //获取物流进度数据
            const {data:res} = await this.$http.get('/kuaidi/1106975712662')
            console.log(res)
        },
        checkkuaidiClose(){
            
        }
    },
    //过滤器
    filters:{
        dataFormat(value){
            if(!value) return;
            const dt = new Date(value)
            const y = dt.getFullYear();
            const m = (dt.getMonth() + 1 + '').padStart(2,'0');
            const d = (dt.getDay() + '').padStart(2,'0');
            const hh =(dt.getHours() + '').padStart(2,'0');
            const mm =(dt.getMinutes() + '').padStart(2,'0');
            const ss =(dt.getSeconds() + '').padStart(2,'0');
            return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
        }
    }
}
</script>

<style lang="less" scoped>
    .el-cascader{width: 100%;}
</style>