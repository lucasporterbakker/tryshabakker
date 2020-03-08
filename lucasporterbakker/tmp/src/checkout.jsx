const React = require('react')
const QRCode = require('qrcode')
const WeChatPay = require('./WeChatPay.jsx')

module.exports = class Checkout extends React.Component {
    ORDER_ROOT

    constructor(props) {
        super(props)
        const {state: {checkout, plans: {list, switches}, select}, COMPANY, ROOT} = props
        console.log('Checkout by company: ', COMPANY)
        if (!COMPANY) {
            return this.setState({error: 'Company need to be set at <div data-user-id="company-name"/>'})
        }
        this.ORDER_ROOT = `${ROOT}/companies/${COMPANY}`
        this.state = Object.assign(checkout, {
            plan: list[select],
            switches,
            debug: false
        })
    }

    setState(change) {
        // console.log(this.state == this.props.service.checkout)
        // console.log(JSON.stringify(this.state), JSON.stringify(this.props.service.checkout))
        // console.log(this.state)
        Object.assign(this.state, change)
        // console.log(this.state)
        this.props.change()
    }

    static async post(url, body) {
        console.log('Posting', url, body)
        let resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        let data = await resp.json()
        console.log('respond', data)
        return data
    }

    async pay(e) {
        e.preventDefault()
        const elements = e.target.elements, {plan, channel} = this.state
        console.log(elements)
        if (elements.confirmEmail.value !== this.state.email)
            return this.setState({error: 'Emails are different'})
        const s4 = () =>
            Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1)
        let user = Object.entries(elements).map(([, e]) => e.name)
            .filter(k => k.startsWith('user.'))
            .map(key => [key.slice(5), elements[key].value])
        let errorFields = user.filter(([_, v]) => v == null || v === '')
        if (errorFields.length > 0)
            return this.setState({error: 'All needs to be filled in: ' + errorFields.map(([k]) => k)})
        this.showProgress('Saving order...')
        let outTradeNumber = s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
        const url = new URL(window.location.href)
        url.searchParams.set('saaskwatch-state', 'success')
        let order = this.state.order = user.reduce((o, [key, value]) => {
            o[key] = value
            return o
        }, {
            outTradeNumber,
            id: outTradeNumber,
            plan,
            totalFee: plan.price * 100,
            company: this.props.COMPANY,
            channel: channel,
            successRedirect: url.href
        })
        const saveOrderResult = await Checkout.post(`${this.ORDER_ROOT}/orders`, order)
        this.showProgress(`Saved order result: ${saveOrderResult}`)
        switch (this.state.channel) {
            case 'WeChatPay':
                this.WeChatPay()
                break
            case 'AliPay':
                this.aliPay()
                break
            default:
                this.setState({error: 'Need to select a payment channel.'})
        }
    }

    showProgress(info) {
        this.setState({info: info})
    }

    async WeChatPay() {
        this.showProgress('Communicating with WeChat Pay...')
        this.setState({startWeChatPay: true})
        let data = await Checkout.post(`${this.props.ROOT}/wechatpay`, this.state.order)
        if (data.result_code === 'FAIL')
            return this.setState({error: data.err_code_des})
        this.showProgress()
        let codeUrl = data.code_url
        console.log('url', codeUrl)
        QRCode.toCanvas(document.getElementById('qrcode'), codeUrl, err =>
            err ? console.error(err) : console.log('success')
        )
    }

    async aliPay() {
        this.showProgress('Communicating with AliPay...')
        let data = await Checkout.post(
            `https://itoqk9bi9l.execute-api.ap-northeast-2.amazonaws.com/latest/companies/${this.props.COMPANY}/stripe`,
            this.state.order)
        this.showProgress()
        let codeUrl = data.redirect.url
        console.log('url', codeUrl)
        window.open(codeUrl, '_blank', 'width=800,height=600')
    }

    render() {
        const {error, info, plan: {name, price}, disabled} = this.state
        return (
          <div class="main-checkout-container">
            <form onSubmit={this.pay.bind(this)}>
                <div style={{display: error ? '' : 'none'}}
                     class="alert alert-danger">{error}</div>
                <div style={{display: info ? '' : 'none'}}
                     class="alert alert-info">{error}</div>

                <div class="checkout-container">
                  <div class="text-center">
                    <h1>Checkout</h1>
                    <p>Confirm plan and continue to payment.</p>
                  </div>
                  <div class="inner-checkout-container">

                    <div class="row form-inline border-bottom pb-5 double-thin">

                      <input class="form-control col-12" name="user.firstName" placeholder="First Name"/>
                      <input class="form-control col-12" name="user.lastName" placeholder="Last Name"/>

                      <input class="form-control col-12" name="user.email" type="email" placeholder="email"
                              value={this.state.email} onChange={event => this.setState({email: event.target.value})}/>
                      <input class="form-control col-12" name="confirmEmail" type="email" placeholder="Confirm Email"/>
                    </div>

                    <div class="row pb5 border-bottom ">
                      <div class="col">
                      {/* <button <h1>Selected Plan</h1> */}
                      <h3>{name}</h3>
                      <p>Your total is:</p>
                      <h3>￥{price}</h3>
                      </div>

                    </div>

                    <h1>Select a payment method</h1>


                      <PaymentChannel setState={this.setState.bind(this)} state={this.state}/>
                      {/*<button onClick={e => this.setState({debug: !this.state.debug})}>refresh</button>*/}
                      {/*<p>{JSON.stringify(this.state)}</p>*/}
                      <button type="submit" class="btn btn-block btn-success" disabled={disabled}>
                      Continue to Payment
                      </button>

                  </div>
                </div>

                <WeChatPay state={this.state}/>
            </form>
          </div>
        )
    }
}

class PaymentChannel extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.state
        this.handleChange = this.handleChange.bind(this)
        if (!this.state.switches) {
            return this.disable()
        }
        const {WeChatPay, AliPay} = this.state.switches
        if (!WeChatPay && !AliPay) {
            return this.disable()
        }
    }

    setState(state) {
        this.props.setState(state)
    }

    handleChange(event) {
        this.setState({channel: event.target.value})
    }

    render() {
        if (this.state.disabled) {
            return <p class="alert alert-danger">You need to config at least 1 payment channel to enable checkout.</p>
        }
        const {WeChatPay, AliPay} = this.state.switches
        return (
            <div>
                {/*{JSON.stringify(this.state)}*/}

                <div class="pay-with-tag">Pay with {this.state.channel}</div>
                <div class="payment-options">
                  <div class="form-inline">
                      {WeChatPay &&
                      <label class="radio-spacing">
                          <input type="radio" name='channel' value="WeChatPay"
                                 onChange={this.handleChange}/>
                          &nbsp; WeChat Pay</label>
                      }
                      {AliPay &&
                      <label class="radio-spacing">
                          <input type="radio" name='channel' value="AliPay"
                                 onChange={this.handleChange}/>
                          &nbsp; AliPay</label>}
                      {AliPay &&
                      <label class="radio-spacing">
                          <input type="radio" name='channel' value="AliPay"
                                onChange={this.handleChange}/>
                          &nbsp; Credit Card</label>}
                  </div>
                </div>
            </div>
        )
    }

    disable() {
        this.setState({disabled: true})
    }
}
