import re

file_path = "/Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-offers-registry.js"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update generateTrackingUrl
old_gen = """    generateTrackingUrl(offerOrId, source = 'portal_free', campaign = '') {
      const offer = typeof offerOrId === 'string' ? this.offers.find(o => o.id === offerOrId) : offerOrId;
      if (!offer) return '#';

      if (offer.provider === 'whatsapp') {
        const phone = (offer.whatsappNumber || '5511996160910').replace(/\D/g, '');
        const text = encodeURIComponent(offer.whatsappPrefillText || 'Olá Professor Leo!');
        return `https://wa.me/${phone}?text=${text}`;
      }

      const baseUrl = offer.checkoutUrl || 'https://pay.hotmart.com';
      try {
        const url = new URL(baseUrl);
        url.searchParams.set('src', source);
        if (campaign) url.searchParams.set('sck', campaign);
        return url.toString();
      } catch (e) {
        const sep = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${sep}src=${encodeURIComponent(source)}${campaign ? '&sck=' + encodeURIComponent(campaign) : ''}`;
      }
    }"""

new_gen = """    generateTrackingUrl(offerOrId, source = 'portal_free', campaign = '') {
      const offer = typeof offerOrId === 'string' ? this.offers.find(o => o.id === offerOrId) : offerOrId;
      if (!offer) return '#';

      if (offer.whatsapp?.enabled || offer.provider === 'whatsapp') {
        const phone = (offer.whatsapp?.number || offer.whatsappNumber || '5511996160910').replace(/\\D/g, '');
        const text = encodeURIComponent(offer.whatsapp?.prefillText || offer.whatsappPrefillText || 'Olá Professor Leo!');
        return `https://wa.me/${phone}?text=${text}`;
      }

      const baseUrl = offer.hotmart?.checkoutUrl || offer.checkoutUrl || 'https://pay.hotmart.com';
      try {
        const url = new URL(baseUrl);
        url.searchParams.set('src', source);
        if (campaign) url.searchParams.set('sck', campaign);
        return url.toString();
      } catch (e) {
        const sep = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${sep}src=${encodeURIComponent(source)}${campaign ? '&sck=' + encodeURIComponent(campaign) : ''}`;
      }
    }"""

content = content.replace(old_gen, new_gen)

# 2. Update parseFirestoreDocument
old_parse = """    // Conversor auxiliar Firestore REST
    parseFirestoreDocument(doc) {
      const f = doc.fields || {};
      const id = f.id?.stringValue || doc.name.split("/").pop();
      const prodId = f.productId?.stringValue || "ms-club";
      const hmId = f.hotmartProductId?.stringValue || (prodId === "ms-club" ? "8460579" : "");
      return {
        id: id,
        title: f.title?.stringValue || id,
        slug: f.slug?.stringValue || id,
        productId: prodId,
        productTitle: f.productTitle?.stringValue || "AgoraEuFalo English Club",
        hotmartProductId: hmId,
        badge: f.badge?.stringValue || "OFERTA",
        status: f.status?.stringValue || "active",
        provider: f.provider?.stringValue || "hotmart",
        isPendingHotmartLink: f.isPendingHotmartLink?.booleanValue ?? true,
        checkoutUrl: f.checkoutUrl?.stringValue || "",
        whatsappNumber: f.whatsappNumber?.stringValue || "+55 11 99616-0910",
        grantedCategories: f.grantedCategories?.arrayValue?.values?.map(v => v.stringValue) || 
          (f.grantedTier?.stringValue ? (
            f.grantedTier.stringValue === 'vip' ? ["member_pago", "member_mentoria"] :
            f.grantedTier.stringValue === 'free' ? ["member_free"] :
            ["member_pago"]
          ) : ["member_pago"]),
        subscription: {
          billingPeriod: f.subscription?.mapValue?.fields?.billingPeriod?.stringValue || 
            (f.accessDuration?.mapValue?.fields?.isLifetime?.booleanValue ? "lifetime" :
            (f.pricing?.mapValue?.fields?.billingType?.stringValue === 'subscription' && f.accessDuration?.mapValue?.fields?.value?.integerValue === "1" ? "monthly" : "annual"))
        },
        grantedCourses: f.grantedCourses?.arrayValue?.values?.map(v => v.stringValue) || [],
        accessDuration: {
          type: f.accessDuration?.mapValue?.fields?.type?.stringValue || "months",
          value: parseInt(f.accessDuration?.mapValue?.fields?.value?.integerValue || "12"),
          isLifetime: f.accessDuration?.mapValue?.fields?.isLifetime?.booleanValue || false
        },
        pricing: {
          billingType: f.pricing?.mapValue?.fields?.billingType?.stringValue || "subscription",
          regularPrice: parseFloat(f.pricing?.mapValue?.fields?.regularPrice?.doubleValue || "497"),
          offerPrice: parseFloat(f.pricing?.mapValue?.fields?.offerPrice?.doubleValue || "497"),
          currency: f.pricing?.mapValue?.fields?.currency?.stringValue || "BRL",
          installmentsText: f.pricing?.mapValue?.fields?.installmentsText?.stringValue || "",
          trialMode: f.pricing?.mapValue?.fields?.trialMode?.stringValue || "none",
          trialDays: parseInt(f.pricing?.mapValue?.fields?.trialDays?.integerValue || "0")
        },
        scarcity: {
          hasCountdown: f.scarcity?.mapValue?.fields?.hasCountdown?.booleanValue || false,
          expiresAt: f.scarcity?.mapValue?.fields?.expiresAt?.stringValue || null,
          countdownMinutes: parseInt(f.scarcity?.mapValue?.fields?.countdownMinutes?.integerValue || "0") || null,
          redirectOnExpireUrl: f.scarcity?.mapValue?.fields?.redirectOnExpireUrl?.stringValue || "",
          spotsLeft: parseInt(f.scarcity?.mapValue?.fields?.spotsLeft?.integerValue || "0") || null
        },
        hotmartSetupSpec: {
          hotmartProductId: f.hotmartSetupSpec?.mapValue?.fields?.hotmartProductId?.stringValue || hmId,
          suggestedProductName: f.hotmartSetupSpec?.mapValue?.fields?.suggestedProductName?.stringValue || "",
          format: f.hotmartSetupSpec?.mapValue?.fields?.format?.stringValue || "",
          suggestedOfferCode: f.hotmartSetupSpec?.mapValue?.fields?.suggestedOfferCode?.stringValue || "",
          regularPriceFormatted: f.hotmartSetupSpec?.mapValue?.fields?.regularPriceFormatted?.stringValue || "",
          offerPriceFormatted: f.hotmartSetupSpec?.mapValue?.fields?.offerPriceFormatted?.stringValue || "",
          installmentsFormatted: f.hotmartSetupSpec?.mapValue?.fields?.installmentsFormatted?.stringValue || "",
          recommendedTracking: f.hotmartSetupSpec?.mapValue?.fields?.recommendedTracking?.stringValue || "",
          notes: f.hotmartSetupSpec?.mapValue?.fields?.notes?.stringValue || ""
        },
        createdAt: f.createdAt?.stringValue || new Date().toISOString(),
        updatedAt: f.updatedAt?.stringValue || new Date().toISOString()
      };
    }"""

new_parse = """    // Conversor auxiliar Firestore REST
    parseFirestoreDocument(doc) {
      const f = doc.fields || {};
      const id = f.id?.stringValue || doc.name.split("/").pop();
      
      // Backward compatibility fields
      const legacyProdId = f.productId?.stringValue || "ms-club";
      const legacyHmId = f.hotmartProductId?.stringValue || (legacyProdId === "ms-club" ? "8460579" : "");
      const legacyGrantedCategories = f.grantedCategories?.arrayValue?.values?.map(v => v.stringValue) || [];
      const legacyGrantedTier = f.grantedTier?.stringValue || "";
      
      // Map to accessTier based on legacy logic if not present
      let accessTier = f.accessTier?.stringValue;
      if (!accessTier) {
        if (legacyGrantedTier === 'vip' || legacyGrantedCategories.includes("member_mentoria")) {
           accessTier = "mentoria_vip";
        } else if (legacyGrantedTier === 'free' || (legacyGrantedCategories.includes("member_free") && !legacyGrantedCategories.includes("member_pago"))) {
           accessTier = "free";
        } else if (f.accessDuration?.mapValue?.fields?.isLifetime?.booleanValue || f.subscription?.mapValue?.fields?.billingPeriod?.stringValue === 'lifetime') {
           accessTier = "lifetime";
        } else if (f.pricing?.mapValue?.fields?.billingType?.stringValue === 'subscription' && f.accessDuration?.mapValue?.fields?.value?.integerValue === "1") {
           accessTier = "club_monthly";
        } else if (legacyProdId && legacyProdId !== "ms-club") {
           accessTier = "standalone";
        } else {
           accessTier = "club_annual";
        }
      }

      const hotmartObj = f.hotmart?.mapValue?.fields || {};
      const stripeObj = f.stripe?.mapValue?.fields || {};
      const whatsappObj = f.whatsapp?.mapValue?.fields || {};
      const pricingObj = f.pricing?.mapValue?.fields || {};
      const scarcityObj = f.scarcity?.mapValue?.fields || {};

      return {
        id: id,
        title: f.title?.stringValue || id,
        slug: f.slug?.stringValue || id,
        badge: f.badge?.stringValue || "OFERTA",
        status: f.status?.stringValue || "active",
        createdAt: f.createdAt?.stringValue || new Date().toISOString(),
        updatedAt: f.updatedAt?.stringValue || new Date().toISOString(),

        accessTier: accessTier,
        grantedCourseIds: f.grantedCourseIds?.arrayValue?.values?.map(v => v.stringValue) || f.grantedCourses?.arrayValue?.values?.map(v => v.stringValue) || [],

        pricing: {
          billingType: pricingObj.billingType?.stringValue || f.pricing?.mapValue?.fields?.billingType?.stringValue || "subscription",
          billingPeriod: pricingObj.billingPeriod?.stringValue || f.pricing?.mapValue?.fields?.billingPeriod?.stringValue || f.subscription?.mapValue?.fields?.billingPeriod?.stringValue || "annual",
          regularPrice: parseFloat(pricingObj.regularPrice?.doubleValue || pricingObj.regularPrice?.integerValue || f.pricing?.mapValue?.fields?.regularPrice?.doubleValue || "497"),
          offerPrice: parseFloat(pricingObj.offerPrice?.doubleValue || pricingObj.offerPrice?.integerValue || f.pricing?.mapValue?.fields?.offerPrice?.doubleValue || "497"),
          currency: pricingObj.currency?.stringValue || f.pricing?.mapValue?.fields?.currency?.stringValue || "BRL",
          installmentsText: pricingObj.installmentsText?.stringValue || f.pricing?.mapValue?.fields?.installmentsText?.stringValue || "",
          trialMode: pricingObj.trialMode?.stringValue || f.pricing?.mapValue?.fields?.trialMode?.stringValue || "none",
          trialDays: parseInt(pricingObj.trialDays?.integerValue || f.pricing?.mapValue?.fields?.trialDays?.integerValue || "0")
        },

        hotmart: {
          productId: hotmartObj.productId?.stringValue || legacyHmId || "",
          offerCode: hotmartObj.offerCode?.stringValue || f.hotmartSetupSpec?.mapValue?.fields?.suggestedOfferCode?.stringValue || id.toUpperCase(),
          checkoutUrl: hotmartObj.checkoutUrl?.stringValue || f.checkoutUrl?.stringValue || "",
        },

        stripe: {
          priceId: stripeObj.priceId?.stringValue || "",
          checkoutUrl: stripeObj.checkoutUrl?.stringValue || "",
        },

        whatsapp: {
          enabled: whatsappObj.enabled?.booleanValue || f.provider?.stringValue === "whatsapp" || false,
          number: whatsappObj.number?.stringValue || f.whatsappNumber?.stringValue || "+55 11 99616-0910",
          prefillText: whatsappObj.prefillText?.stringValue || f.whatsappPrefillText?.stringValue || "Olá Professor Leo!"
        },

        scarcity: {
          hasCountdown: scarcityObj.hasCountdown?.booleanValue || f.scarcity?.mapValue?.fields?.hasCountdown?.booleanValue || false,
          countdownMinutes: parseInt(scarcityObj.countdownMinutes?.integerValue || f.scarcity?.mapValue?.fields?.countdownMinutes?.integerValue || "0") || null,
          spotsLeft: parseInt(scarcityObj.spotsLeft?.integerValue || f.scarcity?.mapValue?.fields?.spotsLeft?.integerValue || "0") || null,
          redirectOnExpireUrl: scarcityObj.redirectOnExpireUrl?.stringValue || f.scarcity?.mapValue?.fields?.redirectOnExpireUrl?.stringValue || ""
        },

        // --- Backward Compatibility Fields ---
        productId: legacyProdId,
        productTitle: f.productTitle?.stringValue || "AgoraEuFalo English Club",
        hotmartProductId: legacyHmId,
        provider: f.provider?.stringValue || "hotmart",
        isPendingHotmartLink: f.isPendingHotmartLink?.booleanValue ?? true,
        checkoutUrl: hotmartObj.checkoutUrl?.stringValue || f.checkoutUrl?.stringValue || "",
        grantedCategories: legacyGrantedCategories.length > 0 ? legacyGrantedCategories : (accessTier === 'free' ? ['member_free'] : ['member_free', 'member_pago']),
        subscription: {
          billingPeriod: pricingObj.billingPeriod?.stringValue || f.subscription?.mapValue?.fields?.billingPeriod?.stringValue || "annual"
        },
        hotmartSetupSpec: {
          hotmartProductId: f.hotmartSetupSpec?.mapValue?.fields?.hotmartProductId?.stringValue || legacyHmId,
          suggestedProductName: f.hotmartSetupSpec?.mapValue?.fields?.suggestedProductName?.stringValue || "",
          format: f.hotmartSetupSpec?.mapValue?.fields?.format?.stringValue || "",
          suggestedOfferCode: f.hotmartSetupSpec?.mapValue?.fields?.suggestedOfferCode?.stringValue || "",
          regularPriceFormatted: f.hotmartSetupSpec?.mapValue?.fields?.regularPriceFormatted?.stringValue || "",
          offerPriceFormatted: f.hotmartSetupSpec?.mapValue?.fields?.offerPriceFormatted?.stringValue || "",
          installmentsFormatted: f.hotmartSetupSpec?.mapValue?.fields?.installmentsFormatted?.stringValue || "",
          recommendedTracking: f.hotmartSetupSpec?.mapValue?.fields?.recommendedTracking?.stringValue || "",
          notes: f.hotmartSetupSpec?.mapValue?.fields?.notes?.stringValue || ""
        }
      };
    }"""

content = content.replace(old_parse, new_parse)


old_save = """      // Normaliza status de link pendente da Hotmart
      if (offerData.provider === 'hotmart') {
        offerData.isPendingHotmartLink = !offerData.checkoutUrl || 
          offerData.checkoutUrl.includes('OFFER_') || 
          offerData.checkoutUrl.trim() === '';
      } else {
        offerData.isPendingHotmartLink = false;
      }

      // Garante hotmartProductId para produtos do AEF Club
      if (offerData.productId === 'ms-club' && !offerData.hotmartProductId) {
        offerData.hotmartProductId = '8460579';
      }"""

new_save = """      // Normaliza status de link pendente da Hotmart
      const finalCheckoutUrl = offerData.hotmart?.checkoutUrl || offerData.checkoutUrl;
      const isHotmart = offerData.hotmart || offerData.provider === 'hotmart';
      if (isHotmart) {
        offerData.isPendingHotmartLink = !finalCheckoutUrl || 
          finalCheckoutUrl.includes('OFFER_') || 
          finalCheckoutUrl.trim() === '';
      } else {
        offerData.isPendingHotmartLink = false;
      }

      // Garante hotmartProductId para produtos do AEF Club
      if ((offerData.productId === 'ms-club' || (offerData.accessTier && offerData.accessTier.includes('club'))) && !offerData.hotmartProductId && !(offerData.hotmart && offerData.hotmart.productId)) {
        if (!offerData.hotmart) offerData.hotmart = {};
        offerData.hotmart.productId = '8460579';
        offerData.hotmartProductId = '8460579'; // backward compat
      }"""

content = content.replace(old_save, new_save)


with open(file_path, "w") as f:
    f.write(content)

print("Done")
