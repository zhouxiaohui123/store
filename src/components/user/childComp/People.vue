<template>
    <div>
        <!-- 匿名插槽 -->
        <slot></slot>
        <slot name="slot1"></slot>
        <slot name="slot2"></slot>
        <slot :data="data"></slot>
    </div>
</template>
<script>
export default {
    data(){
        return {
            data:['zhangsan','liuliu','tianqi','qinglang']
        }
    }
}
</script>
<style lang="less" scoped>
    
</style>
