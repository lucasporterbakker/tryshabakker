// require('../node_modules/bootstrap/scss/bootstrap.scss')
require('./css/main.scss')
const React = require('react')
const ReactDOM = require('react-dom')
const Pricing = require('./pricing.jsx')
const Checkout = require('./checkout.jsx')
// let {
//     Route,
//     HashRouter
// } = require('react-router-dom')

let appendTo = document.getElementById('saas-pricing')
let ROOT = `https://hh4k016jq6.execute-api.ap-northeast-2.amazonaws.com/test`
const COMPANY = appendTo.getAttribute('data-company')
const WIDGET_PATTERN_ROOT = process.env.NODE_ENV === 'production' ? 'widget\\.saas-port\\.com' : 'widget\\.test\\/dist'
const WIDGET_PATTERN = new RegExp(`${WIDGET_PATTERN_ROOT}\\/bundle\\.js`)

function getScriptUrl() {
    const scripts = document.querySelectorAll('script')
    for (const element of scripts) {
        const src = element.src
        if (src && WIDGET_PATTERN.test(src)) return src
    }
}

function getQueryParameters(query) {
    function decode(string) {
        return decodeURIComponent(string || '').replace('+', ' ')
    }

    return query.split('&')
        .map(arg => arg.split('='))
        .map(([key, value]) => [decode(key), decode(value)])
        .reduce((r, [key, value]) => {
            r[key] = value
            return r
        }, {})
}

async function getPlans() {
    const url = `${ROOT}/companies/${COMPANY}/pricing-plans`
    let resp = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    let data = await resp.json()
    console.log('respond', data)

    let plans = data.Item.pricing
    console.log('plans', plans)

    // global variable Not easy for SPA, and not good for maintain
    // console.log('HAHA', HAHA)
    const scriptUrl = getScriptUrl()
    console.log('getScriptUrl', scriptUrl)
    const parameters = getQueryParameters(scriptUrl.replace(/^.*#/, ''))
    console.log('params', parameters)
    const email = parameters.email
    console.log('User email', email)

    class App extends React.Component {
        constructor(props) {
            super(props)
            const search = window.location.search
            const params = new URLSearchParams(search)
            const state = params.get('saaskwatch-state')
            console.log('search', search, state)
            this.state = {
                state: state || 'plans',
                plans: plans,
                select: -1,
                checkout: {
                    email,
                    channel: null
                }
            }
        }

        change() {
            this.setState(this.state)
        }

        render() {
            switch (this.state.state) {
                case 'checkout':
                    return <Checkout state={this.state} ROOT={ROOT} COMPANY={COMPANY}
                                     change={this.change.bind(this)}/>
                case 'success':
                    return <h1>Success</h1>
                    break
                default:
                    return <Pricing state={this.state} setState={this.setState.bind(this)}/>
            }
            // return (
            //     <div>
            //         {/*{JSON.stringify(this.state)}*/}
            //         {/*<HashRouter>*/}
            //             {/*<switch>*/}
            //                 {/*/!*<Route path="/checkout/:id/wechatpay/:email" component={WeChatPay}/>*!/*/}
            //                 {/*/!*<Route exact path="/" component={Pricing} plans={plans}/>*!/*/}
            //                 {/*<Route exact path="/" render={() => <Pricing plans={plans}/>}/>*/}
            //                 {/*<Route path="/checkout/:id" render={props =>*/}
            //                     {/*<Checkout {...props} service={this.state} ROOT={ROOT} COMPANY={COMPANY}*/}
            //                               {/*change={this.change.bind(this)}/>}*/}
            //                 {/*/>*/}
            //             {/*</switch>*/}
            //         {/*</HashRouter>*/}
            //     </div>
            // )
        }
    }

    ReactDOM.render((
            <App/>
        )

        ,
        appendTo
    )
}

getPlans()
