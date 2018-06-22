exports.newCode = (offer, code) => {
  return {
    body: `
    <!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css?family=Exo" rel="stylesheet">
</head>
<body style="width: 650px;margin: 0;">
<div class="wrapper" style="position: relative;text-align: center;background-color: #f1f2f2;font-family: 'Exo', sans-serif;width: 650px;">
    <article class="main" style="text-align: left;background-image: url('./bg_general_code.svg');    height: 553px;	width: 650px;background-size: cover;align-items: center;">
        <img src="./logo_plink.svg" class="logo" style="padding-top: 30px;margin-bottom: 50px;display: block;margin-left: auto;margin-right: auto;">
        <p class="greetings" style="display: block;margin-left: auto;margin-right: auto;margin-bottom: 0px;height: 27px;	width: 147px;	color: #FDF8F1;	font-family: Exo;font-size: 20px;font-weight: bold;letter-spacing: 0.78px;	line-height: 27px;	">Felicitaciones!</p>
        <div class="subtitle" style="display: block;margin-left: auto;margin-right: auto;margin-top: 0px;height: 19px;	width: 276px;	color: #FFF1DE;	font-family: Exo;	font-size: 14px;	font-weight: 500;	letter-spacing: 0.55px;	line-height: 19px;">La oferta es tuya para que la redimas</div>
        <div class="white-coupon" style="    width: 500px;margin-left: auto;margin-right: auto;margin-top: 50px;height:175px;">
            <img src="./pic.jpg" class="main-image" style="display: inline;height: 115.83px;width: 33%;border-radius: 10px;background-color: #FFFFFF;float: left;">
            <div class="left-coupon" style="width: 60%;display: inline;float: right;text-align: left;">
                <div class="main-info" style="height: 69px;	width: 300px;	color: #5C5C5C;	font-family: Exo;	font-size: 16px;	font-weight: 600;	letter-spacing: 0.97px;	line-height: 23px;">30% combo corralisima con papas y gaseosa mediana pagando con tus tarjetas Bancolombia </div>
                <div class="offer" style="display: block;margin-top: 5px;height: 19px;width: 231px;color: #FF6500;font-family: Exo;font-size: 14px;font-weight: 500;letter-spacing: 0.86px;line-height: 19px;">Oferta valida hasta: 12/06/2018</div>
                <div class="brand-info" style="display: block;height: 56px;width: 249px;">
                    <img src="./brand_logo.svg" class="brand-logo" style="height: 54.66px;	float:left; display:inline; width: 20%;">
                    <div class="brand-data" style="color: #9B9B9B;font-family: Exo;font-size: 14px;font-weight: 500;letter-spacing: 0.8px;line-height: 19px;float: left;display: inline;width: 77%;padding-top: 10px;margin-left: 3%;">
                        <div class="brand-name">Hamburguesas El Corral</div>
                        <div class="brand-adress">Carrera 32 D # 9 - 92</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="grey-cupon" style="width: 240px;margin-left: auto;margin-right: auto;margin-top: 15px;">
            <div style="height: 19px;	width: 140px;	color: #5F5E5E;	font-family: Exo;	font-size: 14px;	font-weight: 500;	letter-spacing: 0.86px;	line-height: 19px;    margin-left: auto;margin-right: auto;">
                Mi código de cupon
            </div>
            <div style="height: 31px;	width: 242px;	color: #0D63F9;	font-family: Exo;	font-size: 30px;	font-weight: 600;	letter-spacing: 1.71px;	line-height: 31px;    margin-left: auto;margin-right: auto;margin-top: 10px;">
                ILA156 EP 9654
            </div>
            <div class="tickets" style="margin-left: auto;margin-right: auto;width: 125px;height: 20px;margin-top: 3px;">
                <img src="./ticket.svg" class="ticket" style="box-sizing: border-box;height: 9.67px;width: 13.9px;display: inline;float: left;margin-top: 3px;margin-right: 5px;">
                <div style="height: 17px;width: 105px;color: #4B4B4B;font-family: Exo;font-size: 13px;font-weight: 500;letter-spacing: 0.8px;line-height: 17px;display: inline;float: left;">
                    150 disponibles
                </div>
            </div>
        </div>
    </article>
    <div class="tyc-section" style="display: block;margin-left: auto;margin-right: auto;width: 523.3px;color: #757575;font-family: Exo;font-size: 12px;font-weight: 500;letter-spacing: 0.74px;line-height: 16px;background-color: #f1f2f2;margin-top: 20px;">
        <div class="tyc-title" style="height: 19px;width: 162px;color: #424242;font-family: Exo;font-size: 14px;font-weight: 600;letter-spacing: 0.8px;line-height: 19px;">
            Condiciones generales
        </div>
        <div class="tyc-text" style="width: 523.3px;color: #757575;font-family: Exo;font-size: 12px;font-weight: 500;letter-spacing: 0.74px;line-height: 16px;margin-top: 15px;text-align: left;">
                - BANCOLOMBIA S.A. sólo es el emisor de los medios de pago a través de los
                cuales se puede acceder a los beneficios mencionados. Los beneficios aquí
                descritos son ofrecidos y asumidos por Hamburguesas El Corralpor lo tanto, son ellos los responsables de la oferta, la venta, la entrega, el funcionamiento y la garantía de los mismos.

                - Los Productos y Servicios Financieros son ofrecidos por Bancolombia.
                Producto de crédito sujeto a reglamento.

                - El beneficio corresponde a 30% off en corralisima con papas y gaseosa mediana

                - El beneficio aplica en la tienda física: Carrera 32 D # 9 - 92

                - Este beneficio no es acumulable con bonos de compra, otros descuentos y/o promociones vigentes en el punto de venta. No aplica para domicilios.

                - Bancolombia podrá realizar modificaciones, adiciones o eliminaciones a los
                presentes términos y condiciones en caso de considerarlo necesario.

                - La calidad, idoneidad, seguridad y garantía de los productos y servicios
                ofrecidos son responsabilidad exclusiva de Hamburguesas el corral.

                - Es indispensable mencionar la actividad promocional al momento de realizar el
                pedido, y únicamente para clientes que realicen el pago con tarjetas
                Bancolombia.

                - Descuento válido 12/06/2018

                - Aplica únicamente para la totalidad de compras hechas tarjetas Bancolombia.

                - El beneficio es personal e intransferible, y no es canjeable por efectivo u otros
                bienes y/o servicios. El cumplimiento de las normas de comercialización de los
                productos y/o servicios es total y exclusiva responsabilidad de Hamburguesas El Corral.

                - Las imágenes de los productos son de referencia.
        </div>
    </div>
    <div class="contact" style="width: 650px;	height: 125px;background-color: #f1f2f2;	background-image: url('./bg_footer.svg');">
    </div>
    <div class='disclaimer' style="background-color: #ffffff;display: block;margin-left: auto;margin-right: auto;">
        <div class="contact-info" style="display: block;margin-left: auto;margin-right: auto;color: #FF6500;">
            <div class="contact-title">
                Mantengámonos en contácto
            </div>
            <div class="contact-email" style="font-weight: bold;">
                hello@plink.com.co
            </div>
        </div>
        <img src="./logo_superintendencia.png" class="superintendence" style="position: relative;float: left;bottom: 94px;left: 25px;">
        <div class="footer-logos" style="display: block;margin-left: auto;margin-right: auto;margin-top: 25px;height: 75px;width: 65%;">
            <img src="./logo_bancolombia.svg" class="footer-logo" style="height: 54.66px;display: inline;width: 30%;">
            <img src="./brand_logo.svg" class="brand-footer-logo" style="height: 54.66px;float: right;display: inline;width: 60%;">
        </div>
        <hr class="dotted-line2" style="display: block;margin-left: auto;margin-right: auto;margin-bottom: 0px;width: 150px;border-top: dashed 0px #E0DEDE;height: 0px;" />
        <div class="disclaimer-conatiner" style="display: block;margin-left: auto;margin-right: auto;height: 65px;width: 602.95px;color: #4A4A4A;font-family: Exo;font-size: 10px;letter-spacing: 0.39px;line-height: 13px;text-align: center;margin-top: 18px;margin-bottom: 18px;">
            <div class="disclaimer-text">
                “Bancolombia nunca le solicitará datos financieros como usuarios, claves, números de tarjetas de crédito con sus códigos de seguridad y fechas de vencimiento mediante vínculos de correo electrónico o llamadas telefónicas.
            </div>
            <div class="disclaimer-text2" style="margin-top: 10px;">
                Para verificar la autenticidad de este correo electrónico puede reenviarlo a
            </div>
            <div class="disclaimer-email" style="font-weight: bold;">
                correosospechoso@bancolombia.com.co.”
            </div>
        </div>
        <hr class="dotted-line2" style="display: block;margin-left: auto;margin-right: auto;margin-bottom: 0px;width: 150px;border-top: dashed 0px #E0DEDE;height: 0px;"/>
        <div class="footer" style="display: block;margin-left: auto;margin-right: auto;text-align: center;width: 540px;background-color: #ffffff;color: #FF6500;font-size: 10px;font-weight: 500;letter-spacing: 0.39px;line-height: 13px;margin-top: 20px;">
            PLINK es una marca de Bancolombia S.A. Los productos y servicios ofrecidos a través de PLINK , son otorgados por Bancolombia S.A. Copyright © 2018 GRUPO BANCOLOMBIA.
        </div>
    </div>
</div>
</body>
</html>`,
    email: code.email
  };
};
exports.offerInvalid = (offer, email) => {
  return {
    body: `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css?family=Exo" rel="stylesheet">
    </head>
    <body>
      <div style="background-color: #EAECED;">
        <div style="background-color: #FFF; display: block; margin: 0 auto; width: 600px; height: 665px; text-align: center; padding: 0 0 20px; font-family: 'Exo', sans-serif;">
        <h2 style="font-weight: bold; color: #0D63F9; margin-top: 50px;">${offer.product}</h2>
          <p style="color: #0D63F9; max-width: 70%; margin: 0 auto;">Su oferta expira el dia ${
            offer.expiration
          }</p>
          </a>
          <div style="margin: 10px;">
            <span style="display: inline-block; color: #0D63F9; vertical-align: middle; padding: 15px; font-size: 12px;">hello@plink.com.co</span>
            <div style="color: #0D63F9; display: inline-block; border-left: 1px solid #0D63F9; padding: 0 15px; vertical-align: middle; font-size: 12px;">
              <span style="color: #0D63F9; display: block; margin-bottom: 10px;">+54 4041957</span>
              <span style="color: #0D63F9; vertical-align: middle;">Lun a Vier 8:00 a 17:00</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>`,
    email
  };
};
