# Restaurant Health Framework - Excel Analysis

## Workbook: Restaurant Health Framework.xlsx

### Sheet 1: Dashboard (109 rows x 15 cols)
Main dashboard sheet containing several visual sections:

#### KPI Cards (Rows 2-5)
- **Title**: "RESTAURANT PRODUCT UTILIZATION DASHBOARD"
- **Total Restaurants**: 35
- **Avg Utilization**: 23.3%
- **Healthy**: 14 restaurants
- **Moderate**: 15 restaurants
- **At Risk**: 4 restaurants
- **Critical**: 62 restaurants

#### Health Distribution & Category Utilization (Rows 7-14)
- **Health Distribution Table**: Count per health tier (Healthy=14, Moderate=15, At Risk=4, Critical=62)
- **Category Avg Utilization Table**:
  - Order & Pay: 24.4%
  - Marketing (On): 20.2%
  - Marketing (Off): 15.8%
  - Payroll: 6.3%
  - MoM: 15.6%
  - Tips + Office: 17.4%

#### Top 5 & Bottom 5 Restaurants (Rows 7-21)
- **Top 5**: Laughing Monk (100%), Flights Vegas (97.7%), Martha's Catering (G.K) (96.0%), Martha's Catering (92.7%), 20|Twenty (86.3%)
- **Bottom 5**: Shown with lowest utilization scores and "Critical" health status

#### Product Adoption Rates (Rows 14-33)
- Table with columns: Product, Adopted, Total, Rate
- Ranked by adoption rate (Brandbook 94.3%, POS 77.1%, KDS 71.4%, etc.)
- Lowest: 3PD/Catering at 0%

#### Full Restaurant Ranking (Rows 1-37, cols M-N)
- All 35+ restaurants sorted by utilization %, from Laughing Monk (100%) down to RootStock (12%)
- Bar chart data source

#### Top 5 Restaurants by Product Category (Rows 84-98)
- Six sections: Order & Pay, Marketing (On), Marketing (Off), Payroll, MoM, Tips + Office
- Each shows top 5 restaurants for that category with utilization scores and category averages

#### Cross-Category Top Performers (Rows 100-109)
- Restaurants that appear in top 5 across multiple categories
- Flights Vegas leads with all 6 categories

### Sheet 2: Module Dashboard (93 rows x 32 cols)
- **Title**: "MODULE ADOPTION DASHBOARD"
- **Adoption Summary** (Rows 3-5): Each of 31 modules with Adopted count and Rate
- **Adopted Restaurant Lists** (Rows 6-38): Names of restaurants that adopted each module
- **Not Required (NR) Section** (Rows 41-50): Modules marked NR per restaurant
- **Not Applicable (NA) Section** (Rows 57-93): Modules marked NA per restaurant

### Sheet 3: Product Utilization (99 rows x 44 cols)
- Raw utilization data for all active restaurants
- Columns: S.No, Restaurant Name, then each module (Y/N/NA/NR status)
- Row 3: Module weights
- Row 4: Adopted counts
- Rows 5+: Individual restaurant data

### Sheet 4: Product Utilization (NEW ACC) (16 rows x 44 cols)
- Same format as Sheet 3 but for new accounts only (fewer restaurants)

### Sheet 5: Onboarding Restaurants (38 rows x 43 cols)
- Same format as Sheet 3 but for restaurants in onboarding phase

---

## Charts/Views to Replicate in React Dashboard

1. **KPI Summary Cards** - Total Restaurants, Avg Utilization, Healthy/Moderate/At Risk/Critical counts
2. **Health Distribution Donut** - Pie/donut chart of health tier distribution
3. **Category Utilization Bar Chart** - Average utilization per product category (6 categories)
4. **Restaurant Ranking Bar Chart** - All restaurants sorted by overall utilization % (horizontal bars)
5. **Product Adoption Rate Chart** - Horizontal bar chart showing adoption rate per module
6. **Top 5 by Category** - Top 5 restaurants for each of the 6 product categories
7. **Cross-Category Top Performers** - Table of restaurants appearing in top 5 across multiple categories
