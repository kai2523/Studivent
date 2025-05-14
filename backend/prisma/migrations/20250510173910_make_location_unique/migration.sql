/*
  Warnings:

  - A unique constraint covering the columns `[name,address,city,country]` on the table `locations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "locations_name_address_city_country_key" ON "locations"("name", "address", "city", "country");
