# App Store 배포 로드맵

## 왜 PWA만으로는 App Store에 올리기 어려운가
- App Store는 네이티브 앱 번들을 요구합니다.
- PWA는 웹 앱 형태라서 그대로는 App Store 제출이 불가능합니다.
- 따라서 웹을 감싸는 네이티브 컨테이너가 필요합니다.

## 가장 쉬운 경로: Capacitor로 iOS 래핑
- 기존 웹 앱을 iOS 프로젝트로 감싸서 배포할 수 있습니다.
- 비교적 간단한 과정으로 Xcode에서 빌드/서명/제출이 가능합니다.

## 대략적인 단계(요약)
1. `@capacitor/ios` 설치
2. `npx cap add ios`
3. `npx cap open ios`
4. Xcode에서 실행, 서명 설정, 제출 준비

## Apple Developer Program
- App Store 배포를 위해서는 Apple Developer Program 가입이 필요합니다.
- 유료 멤버십이며, 앱 제출/심사 과정을 거쳐야 합니다.

## 심사 고려 사항(간단)
- 개인정보 처리/데이터 수집 고지
- 기능 완성도 및 안정성
- 스크린샷/메타데이터 준비
