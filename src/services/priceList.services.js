const { PriceList } = require("../model/priceList.model").priceList;

class PriceListService {
  //Create new priceList
  async createPriceList(priceList) {
    return await priceList.save();
  }

  async getPriceListById(priceListId) {
    return await PriceList.findById(priceListId);
  }

  async validatePriceListIds(priceListIds) {
    const priceLists = await PriceList.find({
      _id: { $in: priceListIds },
    });

    const foundIds = priceLists.map((d) => d._id.toString());

    const missingIds = priceListIds.filter((id) => !foundIds.includes(id));

    return missingIds;
  }

  async getPriceListByFilmQualityIdIdAndServiceId(serviceId, filmQualityId) {
    return await PriceList.findOne({ serviceId, filmQualityId }).populate([
      "serviceId",
      "filmQualityId",
    ]);
  }
  async getPriceListByServiceId(serviceId) {
    return await PriceList.findOne({ serviceId }).populate(["serviceId"]);
  }

  async getAllPriceLists() {
    return await PriceList.find().sort({ _id: -1 });
  }

  async updatePriceListById(id, priceList) {
    return await PriceList.findByIdAndUpdate(
      id,
      {
        $set: priceList,
      },
      { new: true }
    );
  }

  async deletePriceList(id) {
    return await PriceList.findByIdAndRemove(id);
  }
}

module.exports = new PriceListService();
