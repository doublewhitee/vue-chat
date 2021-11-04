<template>
  <div>
    <el-upload
      class="avatar-uploader"
      action=""
      :show-file-list="false"
      :auto-upload="false"
      :on-change="changeUpload">
      <img :src="BASE_IMG_URL + imgUrl" class="avatar-img">
    </el-upload>

    <el-dialog
      title="设置头像"
      :visible.sync="dialogVisible"
      width="70%"
      append-to-body
    >
 
      <vue-cropper
        style="width: 100%; height: 350px"
        ref="cropper"
        :img="option.img"
        :outputSize="option.outputSize"
        :outputType="option.outputType"
        :info="option.info"
        :canScale="option.canScale"
        :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :fixed="option.fixed"
        :fixedNumber="option.fixedNumber"
        :full="option.full"
        :fixedBox="option.fixedBox"
        :canMove="option.canMove"
        :canMoveBox="option.canMoveBox"
        :original="option.original"
        :centerBox="option.centerBox"
        :height="option.height"
        :infoTrue="option.infoTrue"
        :maxImgSize="option.maxImgSize"
        :enlarge="option.enlarge"
        :mode="option.mode"
      >
      </vue-cropper>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="uploadImg">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { BASE_IMG_URL } from '@/config/constant'
import { getBase64 } from '@/utils'

import { reqUploadAvatar } from '@/api/user'

import { VueCropper } from 'vue-cropper'

export default {
  components: {
    VueCropper
  },
  props: {
    imgUrl: { type: String, default: '' },
    mode: { type: String, default: 'user_avatar' }
  },
  data () {
    return {
      BASE_IMG_URL,
      dialogVisible: false,
      option: {
        img: '', // 裁剪图片的地址
        outputSize: 1, // 裁剪生成图片的质量(可选0.1 - 1)
        outputType: 'jpeg', // 裁剪生成图片的格式（jpeg || png || webp）
        info: true, // 图片大小信息
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 300, // 默认生成截图框宽度
        autoCropHeight: 300, // 默认生成截图框高度
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        full: false, // false按原比例裁切图片，不失真
        fixedBox: true, // 固定截图框大小，不允许改变
        canMove: false, // 上传图片是否可以移动
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框是否被限制在图片里面
        height: true, // 是否按照设备的dpr 输出等比例图片
        infoTrue: false, // true为展示真实输出图片宽高，false展示看到的截图框宽高
        maxImgSize: 3000, // 限制图片最大宽度和高度
        enlarge: 1, // 图片根据截图框输出比例倍数
        mode: '300px 300px' // 图片默认渲染方式
      }
    }
  },
  methods: {
    changeUpload (file) {
      getBase64(file.raw).then(res => {
        this.option.img = res
        this.dialogVisible = true
      })
    },
    uploadImg () {
      this.$refs.cropper.getCropBlob(async (data) => {
        const formData = new FormData()
        formData.append('file', data, 'AVATAR.jpg')
        if (this.mode === 'user_avatar') {
          const res = await this.$store.dispatch('CHANGE_AVATAR', formData)
          if (res) {
            if (res.code === 0) {
              this.dialogVisible = false
              this.$message.success('上传图片成功！')
            } else {
              this.$message.error(res.msg)
            }
          }
        } else {
          const res = await reqUploadAvatar(formData)
          if (res) {
            if (res.code === 0) {
              this.$emit('imgInfo', res.data)
              this.dialogVisible = false
            } else {
              this.$message.error(res.msg)
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar-uploader {
  .avatar-img {
    border-radius: 6px;
    width: 100px;
    height: 100px;
    cursor: pointer;
  }
}
</style>