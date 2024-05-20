export const whitelabel: WhitelabelConfig[] = [
  {
    name: 'GonnaOrder',
    logo: 'assets/img/branding/gonnaorder/logo-small.svg',
    commercialURL: 'https://www.gonnaorder.com',
    adminSubdomain: 'admin',
    primaryBrandColour: '#273773',
    secondaryBrandColour: '#24AFB2',
    default: true
  },
  {
    name: 'Order Gurus',
    logo: 'assets/img/branding/ordergurus/ordergurus.jpg',
    commercialURL: 'https://www.gonnaorder.com/contact',
    adminSubdomain: 'ordergurus',
    primaryBrandColour: '#003466',
    secondaryBrandColour: '#0171F9'
  },
  {
    name: 'iot Go',
    logo: 'assets/img/branding/iotgo/iotsoft.png',
    commercialURL: 'https://iotsoft.gr/',
    adminSubdomain: 'iotgo',
    primaryBrandColour: '#000000',
    secondaryBrandColour: '#D9000A'
  },
  {
    name: 'Amvrosia Go',
    logo: 'assets/img/branding/sunsoft/Sunsoft-Logo.png',
    commercialURL: 'https://www.sunsoft.gr',
    adminSubdomain: 'sunsoft',
    primaryBrandColour: '#0B4973',
    secondaryBrandColour: '#e63946'

  },
  {
    name: 'Powersoft Go',
    logo: 'assets/img/branding/powersoft/powersoft.jpeg',
    commercialURL: 'https://www.powersoft365.com',
    adminSubdomain: 'powersoft',
    primaryBrandColour: '#112B75',
    secondaryBrandColour: '#009E30'
  },
  {
    name: 'Lucia',
    logo: 'assets/img/branding/lucia/lucia.jpg',
    commercialURL: 'https://www.e-lucia.com',
    adminSubdomain: 'lucia',
    primaryBrandColour: '#000000',
    secondaryBrandColour: '#EF4625'
  },
  {
    name: 'STC',
    logo: 'assets/img/branding/stc/STC-Logo.png',
    commercialURL: 'https://www.stc.com.sa/',
    adminSubdomain: 'stcmarketplace',
    primaryBrandColour: '#320058',
    secondaryBrandColour: '#FF375E'
  },
  {
    name: 'ZIRA',
    logo: 'assets/img/branding/zira/ZIRA-Logo.png',
    commercialURL: 'https://zira.com.ba',
    adminSubdomain: 'ziramarketplace',
    primaryBrandColour: '#15489F',
    secondaryBrandColour: '#09ABD2'
  },
  {
    name: 'Global Vending Solutions',
    logo: 'assets/img/branding/global-vending-solutions/Global-Vending-Solutions_Logo.svg',
    commercialURL: 'https://globalvendingsolutions.com/',
    adminSubdomain: 'gvs',
    primaryBrandColour: '#360D81',
    secondaryBrandColour: '#EC8FDC'
  },
  {
    name: 'Goagle',
    logo: 'assets/img/branding/goagle/Goagle-Logo.png',
    commercialURL: 'https://goagle.co/',
    adminSubdomain: 'goagle',
    primaryBrandColour: '#44600C',
    secondaryBrandColour: '#94CF19'
  },
  {
    name: 'Pluxee Go',
    logo: 'assets/img/branding/pluxee/Pluxee-Logo.png',
    commercialURL: 'https://www.pluxee.be',
    adminSubdomain: 'pluxee',
    primaryBrandColour: '#221C46',
    secondaryBrandColour: '#6DF774'
  },
  {
    name: 'Payabl Go',
    logo: 'assets/img/branding/payable/Payabl-Logo.png',
    commercialURL: 'https://www.payabl.com',
    adminSubdomain: 'payabl',
    primaryBrandColour: '#022128',
    secondaryBrandColour: '#7CDDAE'
  },
  {
    name: 'XO',
    logo: 'assets/img/branding/xo/XO-Logo.png',
    commercialURL: 'https://pamexo.app/',
    adminSubdomain: 'xo',
    primaryBrandColour: '#1D1932',
    secondaryBrandColour: '#6F4FF2'
  },
  {
    name: 'Orexsys Go',
    logo: 'assets/img/branding/twinsoft/Twinsoft-Logo.png',
    commercialURL: 'https://twinsoft.gr/',
    adminSubdomain: 'twinsoft',
    primaryBrandColour: '#170F4C',
    secondaryBrandColour: '#6B63A1'
  },
  {
    name: 'Tap n Go',
    logo: 'assets/img/branding/tapngo/tap-n-go-1.png',
    commercialURL: 'https://www.tapngo.gr',
    adminSubdomain: 'tapngo',
    primaryBrandColour: '#531C02 ',
    secondaryBrandColour: '#FF5607'
  },
  {
    name: 'Tixserve',
    logo: 'assets/img/branding/tixserve/tixserve.png',
    commercialURL: 'https://www.tixserve.com/',
    adminSubdomain: 'tixserve',
    primaryBrandColour: '#000000',
    secondaryBrandColour: '#7A15FF'
  }
]


export interface WhitelabelConfig {
  name?: string;
  logo?: string;
  commercialURL?: string;
  adminSubdomain?: string;
  primaryBrandColour?: string;
  secondaryBrandColour?: string;
  default?: boolean;
}
