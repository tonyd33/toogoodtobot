export interface DiscoverResults {
    item_availability_status: string;
    buckets:                  Bucket[];
}

export interface Bucket {
    filler_type:   string;
    title:         string;
    description?:  string;
    items?:        ItemElement[];
    bucket_type:   BucketType;
    display_type:  string;
    order?:        Order;
    collected_on?: string;
    question?:     string;
    button?:       string;
    stores?:       Store[];
    donation?:     Donation;
}

export interface ItemBucket extends Bucket {
    items: ItemElement[];
    bucket_type: BucketType.Item;
}

export enum BucketType {
    Action = "ACTION",
    Item = "ITEM",
    Store = "STORE",
}

export interface Donation {
    item:            ItemDetails;
    store:           Store;
    display_name:    string;
    pickup_interval: Interval;
    pickup_location: Location;
    purchase_end:    Date;
    items_available: number;
    distance:        number;
    favorite:        boolean;
    in_sales_window: boolean;
    new_item:        boolean;
    item_type:       ItemType;
}

export interface ItemDetails {
    item_id:                     string;
    sales_taxes:                 ItemSalesTax[];
    tax_amount:                  PriceExcludingTaxes;
    price_excluding_taxes:       PriceExcludingTaxes;
    price_including_taxes:       PriceExcludingTaxes;
    value_excluding_taxes:       PriceExcludingTaxes;
    value_including_taxes:       PriceExcludingTaxes;
    taxation_policy:             TaxationPolicy;
    show_sales_taxes:            boolean;
    item_price:                  PriceExcludingTaxes;
    item_value:                  PriceExcludingTaxes;
    cover_picture:               ItemCoverImage;
    logo_picture:                ItemCoverImage;
    name:                        string;
    description:                 string;
    food_handling_instructions?: string;
    can_user_supply_packaging:   boolean;
    packaging_option:            PackagingOption;
    collection_info:             string;
    diet_categories:             string[];
    item_category:               ItemCategory;
    buffet:                      boolean;
    badges:                      Badge[];
    positive_rating_reasons:     PositiveRatingReason[];
    favorite_count:              number;
    average_overall_rating?:     AverageOverallRating;
}

export interface AverageOverallRating {
    average_overall_rating: number;
    rating_count:           number;
    month_count:            number;
}

export interface Badge {
    badge_type:   BadgeType;
    rating_group: RatingGroup;
    percentage:   number;
    user_count:   number;
    month_count:  number;
}

export enum BadgeType {
    OverallRatingTrustScore = "OVERALL_RATING_TRUST_SCORE",
    ServiceRatingScore = "SERVICE_RATING_SCORE",
}

export enum RatingGroup {
    Liked = "LIKED",
    Loved = "LOVED",
}

export interface ItemCoverImage {
    picture_id:               string;
    current_url:              string;
    is_automatically_created: boolean;
}

export enum ItemCategory {
    BakedGoods = "BAKED_GOODS",
    Groceries = "GROCERIES",
    Meal = "MEAL",
    Other = "OTHER",
}

export interface PriceExcludingTaxes {
    code:        CurrencyCode;
    minor_units: number;
    decimals:    number;
}

export enum CurrencyCode {
    CAD = "CAD",
}

export enum PackagingOption {
    BagAllowed = "BAG_ALLOWED",
    MustBringBag = "MUST_BRING_BAG",
    MustBringPackaging = "MUST_BRING_PACKAGING",
}

export enum PositiveRatingReason {
    PositiveFeedbackDeliciousFood = "POSITIVE_FEEDBACK_DELICIOUS_FOOD",
    PositiveFeedbackFriendlyStaff = "POSITIVE_FEEDBACK_FRIENDLY_STAFF",
    PositiveFeedbackGreatQuantity = "POSITIVE_FEEDBACK_GREAT_QUANTITY",
    PositiveFeedbackGreatValue = "POSITIVE_FEEDBACK_GREAT_VALUE",
    PositiveFeedbackGreatVariety = "POSITIVE_FEEDBACK_GREAT_VARIETY",
    PositiveFeedbackQuickCollection = "POSITIVE_FEEDBACK_QUICK_COLLECTION",
}

export interface ItemSalesTax {
    tax_description: TaxDescription;
    tax_percentage:  number;
}

export enum TaxDescription {
    Hst = "HST",
}

export enum TaxationPolicy {
    PriceDoesNotIncludeTaxes = "PRICE_DOES_NOT_INCLUDE_TAXES",
}

export enum ItemType {
    MagicBag = "MAGIC_BAG",
}

export interface Interval {
    start: Date;
    end:   Date;
}

export interface Location {
    address:  Address;
    location: LocationClass;
}

export interface Address {
    country:      Country;
    address_line: string;
    city:         string;
    postal_code:  string;
}

export interface Country {
    iso_code: string;
    name:     string;
}

export interface LocationClass {
    longitude: number;
    latitude:  number;
}

export interface Store {
    store_id:        string;
    store_name:      string;
    branch:          string;
    description:     string;
    tax_identifier:  string;
    website:         string;
    store_location:  Location;
    logo_picture:    ItemCoverImage;
    store_time_zone: string;
    hidden:          boolean;
    favorite_count:  number;
    we_care:         boolean;
    distance:        number;
    cover_picture:   ItemCoverImage;
    is_manufacturer: boolean;
}

export interface ItemElement {
    item:             ItemDetails;
    store:            Store;
    display_name:     string;
    pickup_interval?: Interval;
    pickup_location:  Location;
    purchase_end?:    Date;
    items_available:  number;
    distance:         number;
    favorite:         boolean;
    in_sales_window:  boolean;
    new_item:         boolean;
    item_type:        ItemType;
    sold_out_at?:     Date;
}

export interface Order {
    order_id:                       string;
    state:                          string;
    cancel_until:                   Date;
    redeem_interval:                Interval;
    pickup_interval:                Interval;
    store_time_zone:                string;
    quantity:                       number;
    price_including_taxes:          PriceExcludingTaxes;
    price_excluding_taxes:          PriceExcludingTaxes;
    total_applied_taxes:            PriceExcludingTaxes;
    sales_taxes:                    OrderSalesTax[];
    pickup_location:                Location;
    can_be_rated:                   boolean;
    payment_method_display_name:    string;
    is_rated:                       boolean;
    time_of_purchase:               Date;
    store_id:                       string;
    store_name:                     string;
    store_branch:                   string;
    store_logo:                     ItemCoverImage;
    item_id:                        string;
    item_name:                      string;
    item_cover_image:               ItemCoverImage;
    food_handling_instructions:     string;
    is_buffet:                      boolean;
    can_user_supply_packaging:      boolean;
    packaging_option:               PackagingOption;
    pickup_window_changed:          boolean;
    is_store_we_care:               boolean;
    can_show_best_before_explainer: boolean;
    show_sales_taxes:               boolean;
    order_type:                     string;
    is_support_available:           boolean;
    last_updated_at_utc:            Date;
}

export interface OrderSalesTax {
    tax_description: TaxDescription;
    tax_percentage:  number;
    tax_amount:      PriceExcludingTaxes;
}
