const React = require('react')
module.exports = ({state}) => {
    const className = state.startWeChatPay ? 'modal display-block' : 'modal display-none'
    const center = {margin: 'auto'}
    return <div className={className}>
        <div class="modal-main">
            <div class="mx-auto" style={{width: '150px'}}>
                <canvas id="qrcode"></canvas>
            </div>
            <p class="text-center">请用微信扫描二维码支付</p>
        </div>
    </div>
}
