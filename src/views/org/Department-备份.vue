<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.addUpDept" clearable placeholder="请选择上级部门">
            <el-option
                v-for="item in deptOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.deptManager" clearable placeholder="请选择管理员">
            <el-option
                v-for="item in managers"
                :key="item.id"
                :label="item.username"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>


        <el-form-item>
          <el-button type="primary" v-on:click="getdept">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <!--		:data :绑定的数据-->
    <!--		v-loading: 页面css样式等东西加载之后加载加载数据-->
    <!--		prop:对应的是:data绑定的对象的属性-->
    <!--		label :描述-->
    <el-table :data="dept" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
              style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="name" label="部门名称" width="120" sortable>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="100" sortable>
        <template slot-scope="scope">
          <el-button type="text" size="small"
                     :type="scope.row.state ==0?'danger':'primary'">
            {{ scope.row.state == 0 ? "禁用" : "启用" }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="sn" label="部门编号" width="100" sortable>
      </el-table-column>
      <el-table-column prop="manager.username" label="部门经理" width="100" sortable>
      </el-table-column>

      <el-table-column prop="parent.name" label="上级部门" width="100" sortable>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页条-->
    <el-col :span="24" class="toolbar">
      <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      <!--			current-change:自带的事件,我当前页发生改变时,就会触发此事件-->
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="5" :total="total"
                     style="float:right;">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="部门编号" prop="sn">
          <el-input v-model="editForm.sn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-switch
              style="display: block"
              v-model="editForm.state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="开启"
              inactive-text="禁用">
          </el-switch>
        </el-form-item>
        <el-form-item label="部门经理" prop="managerId">
          <el-select v-model="editForm.name" clearable placeholder="请选择部门经理">
            <el-option
                v-for="(item, index) in allEmp"
                :key="item.id"
                :label="item.manager"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="部门编号" prop="sn">
          <el-input v-model="addForm.sn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-switch
              style="display: block"
              v-model="addForm.state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="开启"
              inactive-text="禁用">
          </el-switch>
        </el-form-item>
        <el-form-item label="部门经理" prop="managerId">
          <el-select v-model="addForm.managerId" clearable placeholder="请选择部门经理">
            <el-option
                v-for="item in allEmp"
                :key="item.id"
                :label="item.username"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item  label="上级部门" prop="">
          <div class="block">
            <el-cascader
                v-model="filters.addUpDept"
                :options="addDept"
                :props="{ expandTrigger: 'hover' }"
                @change="handleChange"></el-cascader>
          </div>
<!--          <el-select v-model="filters.addUpDept" clearable placeholder="请选择上级部门">-->
<!--            <el-option-->
<!--                v-for="item in addDept"-->
<!--                :key="item.id"-->
<!--                :label="item.username"-->
<!--                :value="item.id">-->
<!--            </el-option>-->
<!--          </el-select>-->
        </el-form-item>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>

//import util from '../../common/js/util'
//import NProgress from 'nprogress'
//import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

export default {
  data() {
    return {
      // 部门下拉框数据
      deptOptions: [],
      // 管理员下拉框
      managers: [],
      // 所有员工下拉框
      allEmp: [],
      // 新增界面上级部门下拉框
      addDept: [],
      // addDept: [{
      //   value: 'zhinan',
      //   label: '指南',
      //   children: [{
      //     value: 'shejiyuanze',
      //     label: '设计原则',
      //     children: [{
      //       value: 'yizhi',
      //       label: '一致'
      //     }, {
      //       value: 'fankui',
      //       label: '反馈'
      //     }, {
      //       value: 'xiaolv',
      //       label: '效率'
      //     }, {
      //       value: 'kekong',
      //       label: '可控'
      //     }]
      //   }],
      // }],

      // 高级查询的条件
      filters: {
        name: '',
        upDept: '',
        deptManager: '',
        addUpDept: '',
      },
      dept: [],
      total: 0,
      page: 1,

      listLoading: false,
      sels: [],//列表选中列

      editFormVisible: false,//编辑界面是否显示
      editLoading: false,
      editFormRules: {
        name: [
          {required: true, message: '请输入姓名', trigger: 'blur'}
        ]
      },
      //编辑界面数据
      editForm: {
        id: '',
        name: '',
        sn: '',
        state: null,
        managerId: null,
        manager: '',

      },

      addFormVisible: false,//新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [
          {required: true, message: '请输入姓名', trigger: 'blur'}
        ]
      },
      //新增界面数据
      addForm: {
        name: '',
        sn: '',
        state: null,
        managerId: null,

      }

    }
  },
  methods: {
    //性别显示转换
    //row 当前行row = user  column当前列
    // formatSex: function (row, column) {
    //   return row.state == 1 ? '正常' : row.state == 0 ? '禁用' : '未知';
    // },
    // 上级部门 级联数据
    handleChange(value) {
      console.log(value);
    },
    handleCurrentChange(val) {
      //var 就是当前页的数据
      this.page = val;
      this.getdept();
    },
    //获取部门列表
    getdept() {
      //封装的数据
      let para = {
        //page 就是当前页
        page: this.page,

        //这个是高级查询的条件
        keyword: this.filters.name,
        parentId: this.filters.upDept,
        managerId: this.filters.deptManager,
      };
      this.listLoading = true;
      //NProgress.start();
      this.$http.post("/dept/findPage", para).then((res) => {
        // console.log("全部数据")
        // console.log(res)

        // console.log("后端发送过来的分页数据:"+JSON.stringify(res));
        // 总页数
        this.total = res.data.total;
        // 全部数据
        this.dept = res.data.list;
        //关闭进度条
        this.listLoading = false;
        //NProgress.done();
      });
    },
    // 获取上级部门下拉框数据
    getUpDept() {
      this.$http.get("/dept/upOptions").then(res => {
        this.deptOptions = res.data.data
        // console.log("下拉框数据")
        // console.log(this.deptOptions)
      })
    },

    // 获取上级部门下拉框数据
    getManager() {
      this.$http.get("/user/manager").then(res => {
        this.managers = res.data.data
        // console.log(res)
      })
    },
    // 获取全部员工下拉框数据
    getEmployees() {
      this.$http.get("/user/emp").then(res => {
        this.allEmp = res.data.data
      })
    },
    // 级联数据
    treeDept(){
      this.$http.get("/dept/treeList").then( res => {
        console.log("级联查询数据")
        this.addDept = res.data.data
        console.log(this.addDept)

      })
    },

    //删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        // let para = {id: row.id};
        // removeUser(para).then((res) => {
        this.$http.delete("/dept/"+row.id).then((res) => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getdept();
        });
      }).catch(() => {

      });
    },
    //显示编辑界面
    handleEdit: function (index, row) {
      //显示编辑页面的模态框
      this.editFormVisible = true;
      //Object.assign 是拷贝对象 BeanUtil.copyof()
      this.editForm = row;
      this.editForm.state = !!row.state
      this.editForm.manager = row.manager.username
      // console.log(row)

      console.log("当前修改的数据是:" + JSON.stringify(this.editForm))
    },
    //显示新增界面
    handleAdd: function () {
      this.addFormVisible = true;
      this.addForm = {
        name: '',
        sn: '',
        state: ''

      };
    },
    //编辑
    editSubmit: function () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            //这里面是获取数据的
            this.editLoading = true;
            //拷贝对象
            let para = Object.assign({}, this.editForm);
            para.state = this.editForm.state ? 1 : 0;
            console.log(this.editForm)
            console.log("编辑页面数据")
            this.$http.post("/dept/update", para).then((res) => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['editForm'].resetFields();
              this.editFormVisible = false;
              this.getdept();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function () {
      //$refs调用js 原生dom元素
      //validate
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            //这里才是我们处理数据的地方
            this.addLoading = true;
            //Object.assign 复制对象的
            let para = Object.assign({}, this.addForm);
            para.state = this.addForm.state ? 1 : 0;
            this.$http.post("/dept/update", para).then((res) => {
              this.addLoading = false;
              //elementUi的提示弹框
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              //重新set数据
              this.$refs['addForm'].resetFields();
              this.addFormVisible = false;
              this.getdept();
            });
          });
        }
      });
    },
    //复选勾选框的方法
    selsChange: function (sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function () {
      var ids = this.sels.map(item => item.id);
      // console.log("一堆id")
      // console.log(ids)
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        let para = {"ids": ids};
        // batchRemoveUser(para).then((res) => {
        this.$http.post("/dept/batchRemove", para).then((res) => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getdept();
        });
      }).catch(() => {

      });
    }
  },
  //就是页面已加载完成就会去触发这个mounted
  mounted() {
    // 部门 总数据
    this.getdept();
    // 下拉框上级部门数据
    this.getUpDept();
    // 下拉框管理员的数据
    this.getManager();
    // 下拉框全部员工数据
    this.getEmployees();
    // 级联数据
    this.treeDept()
  }
}

</script>

<style scoped>

</style>
