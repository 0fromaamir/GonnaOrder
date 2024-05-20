import { environment } from "../../environments/environment";
import { Injectable } from "@angular/core";
import { WhitelabelConfig } from "../../environments/whitelabel";
import { WindowRefService } from "../window.service";
import { HelperService } from "../public/helper.service";


@Injectable({
  providedIn: 'root'
})
export class WhitelabelService {

  constructor(
    private windowRefSer: WindowRefService,
    private helper: HelperService
  ) {
  }


  getWhitelabelLogo() {
    return this.getCurrentDomainWhitelabelConfig().logo ?? this.getDefaultWhitelabelConfig().logo;
  }

  getWhitelabelCommericalUrl() {
    return this.getCurrentDomainWhitelabelConfig().commercialURL ?? this.getDefaultWhitelabelConfig().commercialURL;
  }

  getWhiteLabelName() {
    return this.getCurrentDomainWhitelabelConfig().name ?? this.getDefaultWhitelabelConfig().name;
  }

  getWhiteLabelPrimaryBrandColour() {
    return this.getCurrentDomainWhitelabelConfig().primaryBrandColour ?? this.getDefaultWhitelabelConfig().primaryBrandColour;
  }

  getWhiteLabelSecondaryBrandColour() {
    return this.getCurrentDomainWhitelabelConfig().secondaryBrandColour ?? this.getDefaultWhitelabelConfig().secondaryBrandColour;
  }

  getAllWhiteLabelDomains(): string[] {
    return environment.whitelabel.map(value => value.adminSubdomain);
  }

  isWhiteLabelDomain(hostname: string): boolean {
    return this.getAllWhiteLabelDomains().some(value => hostname.startsWith(value));
  }

  getCurrentDomainWhitelabelConfig(): WhitelabelConfig {
    const subdomain = this.getSubdomain();
    const whitelabelConfig = environment.whitelabel.filter(value => value.adminSubdomain === subdomain)?.[0];
    return whitelabelConfig == null ? this.getDefaultWhitelabelConfig() : whitelabelConfig;
  }


  getDefaultWhitelabelConfig(): WhitelabelConfig {
    return environment.whitelabel.filter(value => value.default === true)?.[0];
  }

  getSubdomain() {
    const domain = this.windowRefSer.nativeWindowLocation.hostname;

    if (domain.indexOf(environment.envDomain) < 0) {
      return domain;
    }

    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      return '';
    }
    return domain.split('.')[0];
  }


  getHost() {
    if (this.helper.isMobileApp()) {
      return environment.envDomain;
    }

    let host = this.windowRefSer.nativeWindowLocation.host;
    for (const whiteLabelDomain of this.getAllWhiteLabelDomains()) {
      if (host.includes(whiteLabelDomain + '.')) {
        host = host.replace(whiteLabelDomain + '.', '');
        break;
      }
    }
    return host;
  }


}



