<template>
  <div>
    <div style="text-align: center">
      <canvas id="canvas" style="height:120px; width: 90%" />
    </div>

    <div class="record-time">
      {{ state === 'wait' || state === 'recording' ? duration.toFixed(2) : `${playTime.toFixed(2)} / ${duration.toFixed(2)}` }}
    </div>

    <div class="tool-btns">
      <el-button circle icon="el-icon-close" @click="resetRecord" :disabled="state !== 'stop' && state !== 'pause'" />

      <el-button v-if="state === 'wait'" type="danger" circle class="play-btn" @click="startRecord" />
      <el-button v-else-if="state === 'recording'" type="primary" circle class="play-btn" @click="stopRecord">
        <img src="@/assets/stop.png" alt="stop" style="height: 20px; width: 20px">
      </el-button>
      <el-button v-else-if="state === 'playing'" type="info" circle class="play-btn" @click="pauseRecord">
        <img src="@/assets/pause.png" alt="pause" style="height: 20px; width: 20px">
      </el-button>
      <el-button v-else type="primary" circle class="play-btn" icon="el-icon-caret-right" @click="playRecord" />

      <el-button circle icon="el-icon-check" :disabled="state !== 'stop' && state !== 'pause'" @click="handleSubmit" />
    </div>
  </div>
</template>

<script>
import Recorder from 'js-audio-recorder'

import { reqUploadAudio } from '@/api/chat'

export default {
  data () {
    return {
      recorder: null,
      state: 'wait',
      duration: 0,
      playTime: 0,
      ctx: null,
      waveCanvas: null,
      drawRecordId: null,
      timer: null
    }
  },
  mounted () {
    this.recorder = new Recorder()
    this.recorder.onplayend = () => {
      this.state = 'stop'
      cancelAnimationFrame(this.drawRecordId)
      this.initCanvas()
      clearInterval(this.timer)
      this.playTime = this.duration
    }
    this.recorder.onprogress = (params) => {
      this.duration = params.duration
    }
    this.waveCanvas = document.getElementById('canvas')
    this.ctx = this.waveCanvas.getContext('2d')
    this.initCanvas()
  },
  destroyed () {
    this.recorder.destroy().then(() => {
      this.recorder = null
    })
  },
  methods: {
    startRecord () {
      this.recorder.start().then(() => {
        this.state = 'recording'
        this.drawRecording()
      }).catch(() => {
        this.$message.error('出错了！')
      })
    },
    resetRecord () {
      this.state = 'wait'
      this.duration = 0
      cancelAnimationFrame(this.drawRecordId)
      this.initCanvas()
    },
    stopRecord () {
      this.recorder.stop()
      cancelAnimationFrame(this.drawRecordId)
      this.initCanvas()
      this.state = 'stop'
    },
    playRecord () {
      if (this.state === 'stop') {
        this.recorder.play()
      } else {
        this.recorder.resumePlay()
      }
      this.drawPlaying()
      this.timer = setInterval(() => {
        this.playTime = this.recorder.getPlayTime()
      }, 100)
      this.state = 'playing'
    },
    pauseRecord () {
      this.recorder.pausePlay()
      this.state = 'pause'
      cancelAnimationFrame(this.drawRecordId)
      this.initCanvas()
      clearInterval(this.timer)
    },
    async handleSubmit () {
      const blob = this.recorder.getWAVBlob()
      const formData = new FormData()
      formData.append('file', blob, 'audio.wav')
      const res = await reqUploadAudio(formData)
      if (res) {
        if (res.code === 0) {
          this.$emit('submit', res.data.name)
        } else {
          this.$message.error(res.msg)
        }
      }
    },

    initCanvas () {
      this.ctx.fillStyle = 'rgb(255, 255, 255)'
      this.ctx.fillRect(0, 0, this.waveCanvas.width, this.waveCanvas.height)

      this.ctx.lineWidth = 4
      this.ctx.strokeStyle = '#909399'
      this.ctx.beginPath()
      this.ctx.moveTo(0, this.waveCanvas.height / 2)
      this.ctx.lineTo(this.waveCanvas.width, this.waveCanvas.height / 2)
      this.ctx.stroke()
    },

    drawRecording () {
      // 用requestAnimationFrame稳定60fps绘制
      this.drawRecordId = requestAnimationFrame(this.drawRecording)

      // 实时获取音频大小数据
      let dataArray = this.recorder.getRecordAnalyseData()
      let bufferLength = dataArray.length

      // 填充背景色
      this.ctx.fillStyle = 'rgb(255, 255, 255)'
      this.ctx.fillRect(0, 0, this.waveCanvas.width, this.waveCanvas.height)

      // 设定波形绘制颜色
      this.ctx.lineWidth = 4
      this.ctx.strokeStyle = '#909399'

      this.ctx.beginPath()

      const sliceWidth = this.waveCanvas.width * 1.0 / bufferLength // 一个点占多少位置，共有bufferLength个点要绘制
      let x = 0 // 绘制点的x轴位置

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * this.waveCanvas.height / 2

        if (i === 0) {
          // 第一个点
          this.ctx.moveTo(x, y)
        } else {
          // 剩余的点
          this.ctx.lineTo(x, y)
        }
        // 依次平移，绘制所有点
        x += sliceWidth
      }

      this.ctx.lineTo(this.waveCanvas.width, this.waveCanvas.height / 2)
      this.ctx.stroke()
    },
    drawPlaying () {
      // 用requestAnimationFrame稳定60fps绘制
      this.drawRecordId = requestAnimationFrame(this.drawPlaying)

      // 实时获取音频大小数据
      let dataArray = this.recorder.getPlayAnalyseData()
      let bufferLength = dataArray.length

      // 填充背景色
      this.ctx.fillStyle = 'rgb(255, 255, 255)'
      this.ctx.fillRect(0, 0, this.waveCanvas.width, this.waveCanvas.height)

      // 设定波形绘制颜色
      this.ctx.lineWidth = 4
      this.ctx.strokeStyle = '#909399'

      this.ctx.beginPath()

      const sliceWidth = this.waveCanvas.width * 1.0 / bufferLength // 一个点占多少位置，共有bufferLength个点要绘制
      let x = 0 // 绘制点的x轴位置

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * this.waveCanvas.height / 2

        if (i === 0) {
          // 第一个点
          this.ctx.moveTo(x, y)
        } else {
          // 剩余的点
          this.ctx.lineTo(x, y)
        }
        // 依次平移，绘制所有点
        x += sliceWidth
      }

      this.ctx.lineTo(this.waveCanvas.width, this.waveCanvas.height / 2)
      this.ctx.stroke()
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-btns {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
}

.play-btn {
  width: 50px;
  height: 50px;
  font-size: 25px;
}

.btn {
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: -1px;
  }
}

.record-time {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}
</style>