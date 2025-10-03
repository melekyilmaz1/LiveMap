# 🗺️ Gerçek Zamanlı Olay Raporlama Sistemi

Bu proje, şehir içinde meydana gelen olayların gerçek zamanlı olarak raporlanabilmesini, görüntülenebilmesini ve yönetilebilmesini sağlayan interaktif bir uygulamadır. Kullanıcılar sisteme kayıt olup giriş yaptıktan sonra Mapbox tabanlı harita arayüzü üzerinde olayları anlık olarak görebilir ve yeni olaylar ekleyebilirler. Olay raporlama sürecinde kullanıcıya bir form açılır ve bu formda olay tipi, şiddeti, konum, açıklama ve görsel bilgileri yer alır. Açıklama ve görsel opsiyonel olsa da, konum ve olay tipi gibi bilgiler zorunludur.


Kullanıcılar bir olay raporladığında bu bilgi WebSocket ile sunucuya iletilir ve aynı anda tüm bağlı istemcilere aktarılır. Böylece yeni olaylar sayfa yenilenmeden anında harita üzerinde marker olarak görünür. Bir olayın kaç kişi tarafından raporlandığını gösteren sayaç sayesinde kullanıcılar olayların doğruluğunu kolayca anlayabilir. Ayrıca, olay çözüldüğünde tüm istemcilerden otomatik olarak kaldırılır.


Sistemde raporlanabilecek olay tipleri arasında kaza, yol çalışması, şerit kapatma, trafik yavaşlaması ve yola düşen nesne gibi durumlar yer almaktadır. Opsiyonel olarak, kullanıcının bulunduğu konuma yakın (örneğin 10 km mesafedeki) yeni olaylar için bildirim gönderilebilmekte ve Mapbox’ın reverse geocoding özelliği sayesinde olay eklenirken girilen enlem-boylam bilgisi otomatik olarak gerçek adres bilgisine dönüştürülebilmektedir.


Uygulama, Node.js ve TypeScript ile yazılmış bir backend, PostgreSQL veritabanı, WebSocket tabanlı gerçek zamanlı iletişim yapısı, React tabanlı bir frontend arayüzü ve Mapbox harita servisini kullanmaktadır. Kullanıcı ve olay verileri veritabanında tutulmakta, backend bu verileri işleyerek frontend ve harita arayüzüne aktarmaktadır. Bu sayede proje, kullanıcıların sisteme giriş yaparak olayları yönetebildiği, rol bazlı yetkilendirme ve gerçek zamanlı veri akışıyla desteklenen modern ve ölçeklenebilir bir çözüm sunmaktadır.
