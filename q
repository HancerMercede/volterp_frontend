[33mcommit f20a76ceb43807231e32e8f5541b155233ec523b[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mdevelopment[m[33m)[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Wed Jun 3 19:17:36 2026 -0400

    adding the new changes to employee and client

[33mcommit c2fe5e9112cffab600188ae651be7fed3bea5744[m[33m ([m[1;31morigin/development[m[33m)[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Sun May 31 18:30:19 2026 -0400

    fix(tests): mock API services in store tests to match async backend calls

[33mcommit 9efcaabf6b6a9ecf379aa70dd3e3df9891310519[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Sun May 31 18:23:34 2026 -0400

    feat(RRHH): change photo field from URL to file upload with base64 preview

[33mcommit 608d01e7033cf418e82dcb9462f6f34cac40f922[m
Merge: 6a83ee5 0684279
Author: Hancer Mercede <hancer@mercede.com>
Date:   Sun May 31 18:12:57 2026 -0400

    Merge branch 'feature/frontend-tests' into development

[33mcommit 0684279684d61b1f50bdc8c14715037f75a09f0e[m[33m ([m[1;32mfeature/frontend-tests[m[33m)[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Sun May 31 18:12:50 2026 -0400

    refactor(RRHH): migrate from mock Empleado entity to EmployeeDto across RRHH module

[33mcommit 89016bc14b3cee947929325b2c399347ac653b09[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Sun May 31 13:59:00 2026 -0400

    fix(Ventas): use Zustand correctly - parent hydrates, children consume store directly; fix mockData fields to real API fields

[33mcommit 36424e80e08ccccb8b808952f566e72d9618fd0f[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Fri May 29 22:30:41 2026 -0400

    making some refactor in contabilidad

[33mcommit 1593b57fe5a0a12c7c2bd168a643017a99ede80a[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Fri May 29 18:48:56 2026 -0400

    making some refactor in compras

[33mcommit f81fad38973a87ecf86feabaa1eb401c0500842e[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Fri May 29 18:10:41 2026 -0400

    refactor: flatten pagination to flat totalCount/pageCount across stores

[33mcommit 00b2472c0110bd140daf50e060d9997a38a2debc[m
Author: Hancer Mercede <hancer@mercede.com>
Date:   Fri May 29 16:15:08 2026 -0400

    style: add gradient, glow and modern logo to sidebar

[33mcommit c025a48433e16b52c446f2b2cefbd413f12fd5ce[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 29 10:49:01 2026 -0400

    feat: connect empleado, compra, transaccion stores to backend API

[33mcommit 1ad5e3e05a74a2342ff1ebd18490b8ee22633beb[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 29 10:25:32 2026 -0400

    feat: connect clienteStore to backend API

[33mcommit dd9cde63932beed5c1f541853b0d8b3faad332b9[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu May 28 18:32:01 2026 -0400

    feat: add supplier/purchase/employee/accounting API services with domain types

[33mcommit 9ee1dedc777e29e3c84205cab3e28f214dec02e2[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 25 21:22:31 2026 -0400

    style(ventas): format Ventas component

[33mcommit 6a83ee55730f032ba069fed476c03b8ec89a05a8[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 25 20:56:23 2026 -0400

    refactor(ventas): improve VentasList layout with SearchBar wrapper

[33mcommit b44b9208309c66ec137ac93006ff8adadd4172cd[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 24 21:45:17 2026 -0400

    test: add categoryStore, companyStore, dashboardStore, languageStore tests

[33mcommit 7bbcdf7659c79f97f9227ec72bf1b7c2daeab23b[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 24 20:08:19 2026 -0400

    test: add store unit tests for producto, venta, compra, proveedor

[33mcommit e08f2303c50ce403d303cdf32d1de113e8d0f076[m[33m ([m[1;31morigin/feature/frontend-tests[m[33m)[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Wed May 20 15:58:38 2026 -0400

    fix(ventas): remove unused formatDate from VentaDetail

[33mcommit 0633a3c27b4b5e1257dff62865f6522eede3c991[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Wed May 20 15:54:08 2026 -0400

    feat(ventas): add VentaDetail view + block edit on completed sales

[33mcommit 35664e0612d2b2bf3d4cbbd4b8f5986379df67c2[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Wed May 20 15:43:50 2026 -0400

    fix(ventas): eliminate setState-in-effect warning via key-remount pattern

[33mcommit d10962f9ebdb02d4a61fe20fa5a45c9e87fec034[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Wed May 20 15:39:38 2026 -0400

    refactor(ventas): split 720-line component into small components + hooks

[33mcommit 51b0560fda7cde96fcc2a5b926606deb0cd4f64f[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 17:55:24 2026 -0400

    added the update sales functionality

[33mcommit 6a73527e086e2b99fbba7e9cd7c0fd265ad84381[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 16:33:53 2026 -0400

    Adding the productImageUrl to the request and adding again the searchFilteredClientes

[33mcommit 04b2f1d9dce97fcc999bd9f28a7800c34e8ba31f[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 16:26:55 2026 -0400

    fixing the dropdown in ventas

[33mcommit 470d834814821d6badd38ca4986b1c9ed57f338e[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 15:54:37 2026 -0400

    fix: resolve type errors in Table, Product and SaleItem

[33mcommit 22b6e3bd07aea4ebfd51947a82d8910bc4e6171f[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 15:15:28 2026 -0400

    fix(Ventas): load currentCompany on mount using user.companyId

[33mcommit d8916ad8423b29805aaad9c0fd265b0fd6168594[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 14:50:36 2026 -0400

    fix(domain/types): make imageUrl nullable in Product to match ProductDto

[33mcommit c6ff7dc8b76ea34271c8c3b92d4bfed227df5a32[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 14:42:14 2026 -0400

    fix(Inventario): import CreateProductRequest and UpdateProductRequest from api types

[33mcommit 30546a2db70326ea16a55835905a59326ceed7c8[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 14:37:19 2026 -0400

    refactor(Inventario): use Product type from domain instead of ProductDto

[33mcommit eb74f4f818aff5224bc64abe3cf4fc8c0286fefd[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 14:07:28 2026 -0400

    fix(Inventario): use currentCompany.id instead of hardcoded 1

[33mcommit 8feb957e0ae0bc2e24c3b46eaf8ecdcb9a4a609b[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 14:03:25 2026 -0400

    fix(Reportes): update to use SaleDto fields from backend

[33mcommit db332e05a95e92a5c5dce00b65b4106f7acd3750[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 13:15:50 2026 -0400

    refactor(frontend): use Product type from domain instead of ProductDto

[33mcommit fdac663cdddbdaec019002fe0fed8669c57d35f8[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Mon May 11 13:10:14 2026 -0400

    feat(frontend): integrate sales backend - Task 70

[33mcommit 3d0f2200e95801ec0d0bdd2149ce00dd24586c25[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 10 23:14:04 2026 -0400

    feat: SuperAdmin frontend support

[33mcommit cf04774a23947eaa409d2892f8a52366d6da67c0[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sat May 9 23:37:16 2026 -0400

    feat(company): add currentCompany state to store and integrate with Configuracion

[33mcommit 6a59a387115d890193503713efc4611ba7d4c267[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sat May 9 19:43:25 2026 -0400

    feat(UI): Unificar botones de acciones con ActionButtons

[33mcommit 8d99faf97e5f2f702c87f487770608d4854a1894[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sat May 9 19:11:07 2026 -0400

    adding the company component in configuration

[33mcommit be599ba7531263715b1a4ac64ed51d8fb508efcc[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu May 7 21:41:29 2026 -0400

    removing the useEffect to sincronized the search and look up on sales dropdown

[33mcommit cd3002a646731a73f578f52895b85005eac0d74f[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu May 7 21:00:53 2026 -0400

    add filtered clients in the search box for the sales.

[33mcommit c9cb36dcfeac53d1841cd8f662444afe34964687[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu May 7 10:38:27 2026 -0400

    adding the useFilter hook in Ventas

[33mcommit 9633f0f4a190386641e9450a0a22d588c0f132ae[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu May 7 10:06:57 2026 -0400

    creating the useFilter hook to encapsulate the logic for filtering, implemented on inventario, clientes, rrhh, contabilidad, etc

[33mcommit ebd8fa4c1390bafd0ddb4131da03ce4d3ccf3bf1[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Wed May 6 21:41:12 2026 -0400

    fixing the compiler errors and the pagination

[33mcommit 2e405ed159a3eeda4ed836b0bd16e4b87d9d0b10[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 20:02:24 2026 -0400

    adding a confirm modal to delete any resource

[33mcommit e343600a7f29578fa70d6bca4bfeb78bf7f25fbd[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 19:21:51 2026 -0400

    feat: implement auto-logout on token expiry (2 layers)

[33mcommit 282f8b76b9341a31c47b170f14579d26261bad68[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 16:47:01 2026 -0400

    fix: add ImageUrl to update flow, change column to text

[33mcommit 5960e4a29a466a56c76ed296da6bd126ab5bec32[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 15:53:46 2026 -0400

    ading css style to file loader in inventory and select class for categories

[33mcommit eb4cbb2a303f4fef7355f83e1c33a1933beabe9e[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 15:41:11 2026 -0400

    feat: Product + Category integration with API backend

[33mcommit a1d58916687173ba7b29bfd0bf456e7065d99e23[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 12:55:49 2026 -0400

    feat: UserManagement + name utils

[33mcommit 8a201df928c76061992cf02f1dfda03d0868ed13[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 12:26:06 2026 -0400

    fix: Style fixes for UserManagement modal and Configuracion tabs

[33mcommit a18f7966cbb01bf956c7608070a607d55c6be412[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 12:24:44 2026 -0400

    feat: User management page for Admin

[33mcommit 32591fbfa1b9ef2ebc83b127b3b72c48189165ce[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Tue May 5 12:22:32 2026 -0400

    feat: Frontend auth integration + Register page

[33mcommit aadede94b3a50176f1afd80124e52a869c31720a[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 21:59:00 2026 -0400

    feat: add Attendance module with Recharts dashboard

[33mcommit 9444416dbe5abd64a69c74ce4b03af73afb9d8b2[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 19:53:58 2026 -0400

    feat(i18n): complete multi-language translation (ES/EN) for all pages

[33mcommit 310980e47fa9a1c83aedcd4abbdf3e466fedd03d[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 19:30:48 2026 -0400

    feat(Soporte): add AI-powered support chat with smart conversation handling

[33mcommit 47ee586f266db516c114abfed60bdb82e16ed807[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 19:13:21 2026 -0400

    refactor: complete migration from Context API to Zustand stores (Phase 3)

[33mcommit ffe65e128270ffde2369353f4bff744e50a552ff[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 19:03:31 2026 -0400

    refactor: migrate AuthContext to Zustand store with persist middleware (Phase 2)

[33mcommit 6d16ae321f53eddb680e4725ca616ff604a584ae[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 19:02:33 2026 -0400

    refactor: migrate UIContext to Zustand store (Phase 1)

[33mcommit 46ea77a8285f3f7c09226b3a00a0e3670663a310[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 18:50:58 2026 -0400

    feat: redesign login page with modern split-screen layout, input icons, password toggle, and animated loading state

[33mcommit 3b1ad822601130e77dc4a0491593df7d2e2ca95c[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 18:47:48 2026 -0400

    feat(RRHH): add Beneficio types and BeneficiosSection component for employee benefits (vacations, insurance, AFP)

[33mcommit 37e22856f3416e7f8ee97c50cf94763e50732145[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 18:35:42 2026 -0400

    feat(RRHH): add Nomina types and NominaCalculator component for payroll calculation

[33mcommit edd35abeb4ecaa82910fd1446ee986d6a03a2533[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 18:29:16 2026 -0400

    refactor(RRHH): split monolithic component into small focused parts

[33mcommit 99883f289db7433da4eeea452b573dc9c39ca435[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 18:26:46 2026 -0400

    feat(RRHH): implement multi-step form with 6 steps for complete employee data entry

[33mcommit db44f9ff9b6857bf3e354c72e4796d8bf7c2d02e[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Sun May 3 18:25:33 2026 -0400

    refactor: add Empleado entity with complete structure for RD (AFP, ARS, NSS) and Clean Architecture domain layer

[33mcommit d2d6e53734f85eb30ed4421d9accebffc4745b2f[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 20:48:46 2026 -0400

    feat: add login system with roles and permissions

[33mcommit d7f2b357568b83ce0a1c82c199a35207151caf24[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 18:36:31 2026 -0400

    Ventas: reorder POS layout, add paginationWrapper, use ImageCell for products grid

[33mcommit 7c0092cec0b793a0519556c6ed31bc52d007fda0[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 17:25:00 2026 -0400

    reorder POS layout: products left, cart center, summary right

[33mcommit e80cf9371490433b108ee505db55da3b6013ae2b[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 15:11:37 2026 -0400

    changing the hover css properties for the navlinks hover removing a transform: translateX:4px for letter-spacing:0.07em

[33mcommit 70e48c698a399be22852a1bd83be928ba7c15c02[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 11:47:13 2026 -0400

    fixing the search and dropdown inputs

[33mcommit ce1410120615962d75352363774265d60c1cdb48[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 11:38:39 2026 -0400

    feat: scroll interno en layout, sidebar fijo con scroll en nav

[33mcommit 35d79a3ed1688c7e2c5ac5604d5a3a0f3886a2e9[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 11:26:32 2026 -0400

    feat: crear componente Modal centralizado con portal y actualizar todos los modulos para usarlo

[33mcommit f2c379c55bb6d133d75ec128b8c08dc6c00b0a05[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 11:05:14 2026 -0400

    feat: agregar componente SearchInput reutilizable y actualizar todos los modulos

[33mcommit 39e1836d92fc4a12a7c520ae16c1c4b60a0e9a0e[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 09:55:00 2026 -0400

    chore: cambiar paginacion de 20 a 10 items por pagina

[33mcommit 5269b92d14dea05b12046a445b684ea82ca95ae8[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 09:54:16 2026 -0400

    feat: agregar paginacion a Ventas, Proveedores, RRHH, Proyectos y Contabilidad

[33mcommit 415685ed00fa5e1afcb9d31960b8c044c5cb8812[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 09:47:17 2026 -0400

    feat: agregar paginacion a clientes, compras e inventario (20 items por pagina)

[33mcommit 0ecffb95fead08f80776e247229215e6b7e8f8fc[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 09:32:55 2026 -0400

    feat: wrapper app centrado, estilo pastel completo, subtitles en todas las paginas

[33mcommit 0f0beb8c301b269673fc364b16aeaeef30ba8211[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 09:05:23 2026 -0400

    style: aplicar estilo pastel al Dashboard

[33mcommit bc74d419ad2c3c269164aa2c4b3f5599a7bcf220[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Fri May 1 09:01:43 2026 -0400

    style: aplicar estilo pastel a Sidebar, Reportes, Configuracion, Ventas y Table

[33mcommit a978d02f206ac23ed13255e1f326a08a7e26d909[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu Apr 30 21:19:59 2026 -0400

    feat: nuevo panel POS estilo supermercado con paginacion

[33mcommit 71995dab1bd2f1ed4f6d3fdb402c27ffade7acb9[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu Apr 30 20:18:41 2026 -0400

    refactor: mejoras y limpieza del proyecto

[33mcommit bf42fa80670f04de3c06e2673a3f8db3a4d204de[m
Author: Hancer <hancermercedes@gmail.com>
Date:   Thu Apr 30 18:12:54 2026 -0400

    fix: corregir columnas de tablas y agregar botones de acciones
