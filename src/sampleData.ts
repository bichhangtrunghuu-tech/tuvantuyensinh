import { AdmissionsDoc } from './types';

export const SAMPLE_DOCUMENTS: AdmissionsDoc[] = [
  {
    id: 'greenwich-1',
    title: 'Quy định Học bổng GRE Talent 2025',
    category: 'scholarship',
    content: `CHƯƠNG TRÌNH HỌC BỔNG GRE TALENT - GREENWICH VIETNAM 2025

1. Giá trị học bổng:
- Tính theo số % học phí các kỳ học chuyên ngành tương ứng với các mức học bổng từ 30% - 50% - 70% - 100%.
- Hình thức áp dụng: Số tiền tương ứng với mức học bổng được trừ thẳng vào tiền học phí các học kỳ chuyên ngành.

2. Điều kiện xét duyệt học bổng (Thí sinh cần thỏa mãn ít nhất 01 trong các điều kiện sau để tham gia vòng phỏng vấn):
- Điều kiện 1 (Xét điểm học bạ): Có ít nhất 06 (sáu) môn học có điểm trung bình môn cả năm lớp 11 hoặc học kỳ 1 lớp 12 hoặc cả năm lớp 12 đạt từ 9,0 điểm trở lên.
- Điều kiện 2 (Giải thưởng học thuật): Đạt giải khuyến khích trở lên trong các kỳ thi cấp quốc gia, quốc tế hoặc giải ba trở lên cấp Tỉnh/Thành phố thuộc trung ương đối với một trong các môn học cho học sinh THPT (Toán, Vật lý, Hóa học, Ngữ văn, Tiếng Anh, Lịch sử, Địa lý, Sinh học, Tin học).
- Điều kiện 3 (Chứng chỉ ngoại ngữ): Có chứng chỉ IELTS 8.0 trở lên nếu xét tuyển và nhập học tại cơ sở Hà Nội / Hồ Chí Minh; hoặc IELTS từ 7.0 trở lên nếu xét tuyển và nhập học tại cơ sở Đà Nẵng / Cần Thơ. Chứng chỉ phải còn hạn tính tại thời điểm nộp hồ sơ xét tuyển.
- Điều kiện 4 (Năng khiếu, đóng góp xã hội): Đạt thành tích cao hoặc có đóng góp nổi bật trong các hoạt động nghệ thuật, văn hóa, xã hội, thể thao.

3. Quy trình phỏng vấn học bổng:
- Thí sinh thỏa mãn 01 trong các điều kiện trên sẽ tham gia phỏng vấn trực tiếp cùng Hội đồng Chuyên môn của Greenwich Vietnam.
- Thí sinh KHÔNG đạt phỏng vấn sẽ mặc định được cấp học bổng Golden Compass (nếu xét theo điều kiện 1, 2, 4) hoặc Golden Passport (nếu xét theo điều kiện 3).`
  },
  {
    id: 'greenwich-2',
    title: 'Học bổng xét theo hồ sơ (Passport & Compass) 2025',
    category: 'scholarship',
    content: `CÁC LOẠI HỌC BỔNG XÉT THEO ĐIỂM HỒ SƠ (KHÔNG CẦN PHỎNG VẤN)

1. Học bổng Golden Passport:
- Điều kiện: Thí sinh có điểm IELTS từ 7.0 trở lên xét tuyển và nhập học tại cơ sở Hà Nội/Hồ Chí Minh hoặc IELTS từ 6.0 trở lên nếu xét tuyển và nhập học tại cơ sở Đà Nẵng/Cần Thơ (chứng chỉ IELTS còn hạn tại thời điểm nộp hồ sơ).
- Giá trị học bổng: Giảm 20% học phí giai đoạn chuyên ngành (trừ thẳng vào tiền học phí phải nộp hàng kỳ).

2. Học bổng Silver Passport:
- Điều kiện: Thí sinh có điểm IELTS từ 6.0 trở lên xét tuyển và nhập học tại cơ sở Hà Nội/Hồ Chí Minh hoặc IELTS từ 5.5 trở lên nếu xét tuyển và nhập học tại cơ sở Đà Nẵng/Cần Thơ.
- Giá trị học bổng: Giảm 15% học phí giai đoạn chuyên ngành (trừ thẳng vào tiền học phí phải nộp hàng kỳ).

3. Học bổng Golden Compass:
- Điều kiện (thỏa mãn 1 trong các điều kiện sau):
  + Điều kiện 1: Tổng điểm trung bình 3 môn bất kỳ (trong các môn Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, Tin) của cả năm lớp 11 hoặc học kỳ 1 lớp 12 hoặc cả năm lớp 12 đạt từ 25 trở lên. Trong tổ hợp ít nhất phải có 1 trong 2 môn Toán hoặc Ngữ Văn.
  + Điều kiện 2: Tổng điểm 3 môn thi kỳ thi Tốt nghiệp THPT năm 2025 (không nhân hệ số, không tính điểm ưu tiên) đạt từ 25 trở lên.
  + Điều kiện 3: Thí sinh tốt nghiệp các chương trình cấp chứng chỉ quốc tế như A-level/IB và không có môn nào dưới điểm C.
- Giá trị học bổng: Trị giá 35.000.000 VNĐ.
- Hình thức áp dụng: Được trừ đều vào học phí các kỳ tiếng Anh và học kỳ chuyên ngành, mỗi lần trừ 5.000.000 VNĐ cho đến khi hết giá trị.

4. Học bổng Silver Compass:
- Điều kiện:
  + Điều kiện 1: Tổng điểm trung bình 3 môn đạt từ 23 trở lên học bạ (trong tổ hợp ít nhất có Toán hoặc Văn).
  + Điều kiện 2: Tổng điểm 3 môn thi Tốt nghiệp THPT 2025 đạt từ 23 trở lên.
- Giá trị học bổng: Trị giá 25.000.000 VNĐ.
- Hình thức áp dụng: Trừ đều vào học phí các kỳ tiếng Anh và học kỳ chuyên ngành, mỗi lần trừ 5.000.000 VNĐ cho đến khi hết giá trị.`
  },
  {
    id: 'greenwich-3',
    title: 'Các chương trình ưu đãi nhập học & Quy định chung',
    category: 'scholarship',
    content: `CÁC CHƯƠNG TRÌNH ƯU ĐÃI NHẬP HỌC KHÁC NĂM 2025

1. Ưu đãi Công nghệ (Dành cho tân sinh viên hoàn thành sớm thủ tục):
- Giá trị ưu đãi: Trị giá 5.000.000 VNĐ/suất.
- Đối tượng áp dụng: Thí sinh trúng tuyển và hoàn thành các khoản phí nhập học theo quy định trước ngày 31/7/2025.
- Hình thức áp dụng: Được trừ trực tiếp vào phí nộp lần đầu khi trúng tuyển và KHÔNG áp dụng chung với học bổng hoặc ưu đãi khác.
- Số lượng giới hạn: 300 suất toàn quốc.

2. Ưu đãi dành cho học sinh THPT FPT:
- Đối tượng áp dụng: Áp dụng cho thí sinh trúng tuyển và hoàn thành các khoản phí nhập học là học sinh tốt nghiệp THPT FPT.
- Giá trị ưu đãi: Trị giá 25.000.000 VNĐ.
- Hình thức áp dụng: Trừ đều vào học phí các kỳ tiếng Anh và học kỳ chuyên ngành, mỗi lần trừ 5.000.000 VNĐ cho đến khi hết giá trị.

3. Ưu đãi cán bộ nhân viên tổ chức FPT Education (FE) và người thân:
- Áp dụng giảm học phí 30% theo quy định chung số 02/QĐ-CTGDFPT ngày 19/01/2022 của Tổng giám đốc Công ty TNHH Giáo dục FPT.

4. Quy định chung về quản lý học bổng, ưu đãi:
- Nộp phí giữ học bổng: Thí sinh đủ điều kiện trúng tuyển cần nộp phí giữ học bổng bằng học phí kỳ tiếng Anh đầu tiên trừ đi phần học bổng, ưu đãi được hưởng. Khoản phí này không hoàn lại và sẽ chuyển thành học phí khi nhập học chính thức.
- Nguyên tắc cộng dồn: Trường hợp thí sinh thuộc diện nhận nhiều loại học bổng và ưu đãi thì CHỈ ĐƯỢC HƯỞNG 01 LOẠI học bổng, ưu đãi có giá trị lớn nhất.
- Chuyển nhượng & Quy đổi: Học bổng, ưu đãi mang tính chất đích danh cho cá nhân trúng tuyển, không thể chuyển nhượng cho người khác và không có giá trị quy đổi thành tiền mặt.
- Học bổng chỉ được tính trừ thẳng vào tiền học phí thực tế hàng kỳ của sinh viên, không bao gồm lệ phí tuyển sinh hay bất cứ khoản lệ phí nào khác.`
  },
  {
    id: 'greenwich-4',
    title: 'Học phí dự kiến Greenwich Việt Nam 2025',
    category: 'tuition',
    content: `BIỂU PHÍ VÀ LỘ TRÌNH HỌC PHÍ DỰ KIẾN NIÊN KHÓA 2025

1. Lộ trình học tập tổng quan:
- Giai đoạn 1 (Tiếng Anh chuẩn bị): Gồm tối đa 5 mức học, tùy thuộc vào kết quả kiểm tra năng lực tiếng Anh đầu vào của thí sinh. Thí sinh có IELTS 6.0 trở lên hoặc tương đương được miễn hoàn toàn giai đoạn này và vào thẳng Chuyên ngành.
- Giai đoạn 2 (Chuyên ngành): Gồm 9 học kỳ chuyên ngành kéo dài trong 3 năm.

2. Học phí chuẩn (Học phí không có học bổng):
- Mức học phí tại cơ sở Hà Nội và TP. Hồ Chí Minh (HN/HCM):
  + Học phí tiếng Anh chuẩn bị: 11.300.000 VNĐ / mức.
  + Học phí giai đoạn chuyên ngành: 28.500.000 VNĐ / học kỳ.
  + Tổng giá trị học phí chuyên ngành dự kiến (9 kỳ): 256.500.000 VNĐ.

- Mức học phí tại cơ sở Đà Nẵng và Cần Thơ (ĐN/CT):
  + Học phí tiếng Anh chuẩn bị: 7.900.000 VNĐ / mức.
  + Học phí giai đoạn chuyên ngành: 19.900.000 VNĐ / học kỳ.
  + Tổng giá trị học phí chuyên ngành dự kiến (9 kỳ): 179.100.000 VNĐ.

3. Lệ phí tuyển sinh (Đóng 1 lần duy nhất khi nộp hồ sơ):
- Lệ phí xét tuyển đầu vào: 2.000.000 VNĐ (Không hoàn lại dưới mọi hình thức).`
  }
];
